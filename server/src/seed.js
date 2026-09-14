require("dotenv").config();
const bcrypt = require("bcryptjs");
const {
  sequelize,
  User,
  CustomerProfile,
  ArtistProfile,
  PortfolioItem,
  Category,
  Artwork,
  ArtworkImage,
} = require("./models");
const { nextDisplayId } = require("./utils/displayId");

const CATEGORIES = [
  "Portrait",
  "Landscape",
  "Abstract",
  "Realism",
  "Modern",
  "Traditional",
  "Nature",
  "Filipino Culture",
  "Digital Art",
  "Religious Art",
];

const ARTISTS = [
  {
    username: "mara.delacruz",
    firstName: "Mara",
    lastName: "Dela Cruz",
    artistName: "Mara Dela Cruz",
    bio: "Contemporary painter working primarily in oil, drawing on coastal life in the Visayas.",
    statement: "I paint the quiet moments between the tide going out and coming back in.",
    specialization: "Landscape & Seascape",
    style: "Impressionism",
    medium: "Oil on canvas",
    yearsExperience: 9,
    intro: "Island-inspired oil painter based in the Visayas.",
    location: "Iloilo City, Philippines",
    avatar: "seed-avatar-1.jpg",
    cover: "seed-cover-1.jpg",
  },
  {
    username: "jun.santos",
    firstName: "Jun",
    lastName: "Santos",
    artistName: "Jun Santos",
    bio: "Self-taught abstract artist exploring color theory through acrylic and mixed media.",
    statement: "Color is emotion made visible.",
    specialization: "Abstract",
    style: "Abstract Expressionism",
    medium: "Acrylic",
    yearsExperience: 6,
    intro: "Bold, color-driven abstract works.",
    location: "Cebu City, Philippines",
    avatar: "seed-avatar-2.jpg",
    cover: "seed-cover-2.jpg",
  },
  {
    username: "liwayway.reyes",
    firstName: "Liwayway",
    lastName: "Reyes",
    artistName: "Liwayway Reyes",
    bio: "Portrait and cultural artist celebrating Filipino heritage through realism.",
    statement: "Every face carries a history worth painting carefully.",
    specialization: "Portrait",
    style: "Realism",
    medium: "Oil on canvas",
    yearsExperience: 14,
    intro: "Realist portraiture rooted in Filipino identity.",
    location: "Manila, Philippines",
    avatar: "seed-avatar-3.jpg",
    cover: "seed-cover-3.jpg",
  },
];

const PENDING_ARTIST = {
  username: "ken.villareal",
  firstName: "Ken",
  lastName: "Villareal",
  artistName: "Ken Villareal",
  bio: "Emerging digital and traditional mixed-media artist.",
  statement: "Still finding my voice, one canvas at a time.",
  specialization: "Digital Art",
  style: "Modern",
  medium: "Digital / Mixed Media",
  yearsExperience: 2,
  intro: "New artist applying to join Pinta Isla.",
  location: "Bacolod City, Philippines",
  avatar: "seed-avatar-4.jpg",
};

async function upsertUser(data, transaction) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return User.create(
    {
      role: data.role,
      status: data.status,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      passwordHash,
      phone: data.phone || "+63 900 000 0000",
      profileImage: data.avatar ? `/uploads/${data.avatar}` : null,
      isSeed: true,
    },
    { transaction }
  );
}

async function seed() {
  await sequelize.sync({ force: true });
  const t = await sequelize.transaction();
  try {
    // ---- Admin ----
    await upsertUser(
      {
        role: "admin",
        status: "active",
        firstName: "Pinta",
        lastName: "Admin",
        username: "admin",
        email: "admin@pintaisla.art",
        password: "Admin@12345",
      },
      t
    );

    // ---- Categories ----
    const categories = {};
    for (const name of CATEGORIES) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const cat = await Category.create({ name, slug }, { transaction: t });
      categories[name] = cat;
    }

    // ---- Approved artists + artworks ----
    const artworkSeedTitles = [
      { title: "Tide at Dawn", price: 8500, medium: "Oil on canvas", style: "Impressionism", category: "Seascape" },
      { title: "Banca Under Monsoon Light", price: 12000, medium: "Oil on canvas", style: "Impressionism", category: "Landscape" },
      { title: "Fields of Amber", price: 6500, medium: "Oil on canvas", style: "Realism", category: "Landscape" },
    ];

    let artworkImgIndex = 1;
    for (let i = 0; i < ARTISTS.length; i++) {
      const a = ARTISTS[i];
      const user = await upsertUser(
        { ...a, role: "artist", status: "active", email: `${a.username}@pintaisla.art`, password: "Artist@12345" },
        t
      );

      const displayId = await nextDisplayId(ArtistProfile, "ARTIST", t);
      const profile = await ArtistProfile.create(
        {
          userId: user.id,
          displayId,
          artistName: a.artistName,
          bio: a.bio,
          statement: a.statement,
          specialization: a.specialization,
          style: a.style,
          medium: a.medium,
          yearsExperience: a.yearsExperience,
          intro: a.intro,
          location: a.location,
          coverImage: `/uploads/${a.cover}`,
          verified: i < 2, // first two are verified, for a realistic mix
          socialLinks: { instagram: `https://instagram.com/${a.username}` },
        },
        { transaction: t }
      );

      // 3 artworks per artist, statuses mixed so moderation queues aren't empty
      const statuses = ["available", "available", "pending_review"];
      for (let j = 0; j < 3; j++) {
        const artDisplayId = await nextDisplayId(Artwork, "ART", t);
        const base = artworkSeedTitles[j % artworkSeedTitles.length];
        const categoryName = Object.keys(categories)[(i + j) % CATEGORIES.length];

        const artwork = await Artwork.create(
          {
            artistProfileId: profile.id,
            categoryId: categories[categoryName].id,
            displayId: artDisplayId,
            title: `${base.title}${j > 0 ? ` ${["II", "III"][j - 1] || ""}` : ""}`.trim(),
            description:
              "An original piece exploring light, texture, and place — created and shipped from the artist's studio.",
            story: a.statement,
            price: base.price + i * 500 + j * 300,
            type: "original",
            medium: base.medium,
            style: base.style,
            width: 24,
            height: 36,
            unit: "in",
            yearCreated: 2023 + j,
            framed: j % 2 === 0,
            weight: 3.2,
            quantity: 1,
            shippingInfo: "Ships within 5-7 business days, carefully packed and insured.",
            status: statuses[j],
            isSeed: true,
          },
          { transaction: t }
        );

        await ArtworkImage.create(
          {
            artworkId: artwork.id,
            url: `/uploads/seed-artwork-${((artworkImgIndex - 1) % 10) + 1}.jpg`,
            isMain: true,
            sortOrder: 0,
          },
          { transaction: t }
        );
        artworkImgIndex++;
      }
    }

    // ---- Pending artist application (for admin approval demo) ----
    const pendingUser = await upsertUser(
      {
        ...PENDING_ARTIST,
        role: "artist",
        status: "pending_approval",
        email: `${PENDING_ARTIST.username}@pintaisla.art`,
        password: "Artist@12345",
      },
      t
    );
    const pendingDisplayId = await nextDisplayId(ArtistProfile, "ARTIST", t);
    const pendingProfile = await ArtistProfile.create(
      {
        userId: pendingUser.id,
        displayId: pendingDisplayId,
        artistName: PENDING_ARTIST.artistName,
        bio: PENDING_ARTIST.bio,
        statement: PENDING_ARTIST.statement,
        specialization: PENDING_ARTIST.specialization,
        style: PENDING_ARTIST.style,
        medium: PENDING_ARTIST.medium,
        yearsExperience: PENDING_ARTIST.yearsExperience,
        intro: PENDING_ARTIST.intro,
        location: PENDING_ARTIST.location,
      },
      { transaction: t }
    );
    await PortfolioItem.create(
      {
        artistProfileId: pendingProfile.id,
        image: `/uploads/seed-artwork-${((artworkImgIndex - 1) % 10) + 1}.jpg`,
        title: "Sample portfolio piece",
        description: "Submitted with the artist application.",
        medium: "Mixed media",
        year: 2024,
      },
      { transaction: t }
    );

    // ---- Demo customer ----
    const customer = await upsertUser(
      {
        role: "customer",
        status: "active",
        firstName: "Ana",
        lastName: "Lopez",
        username: "ana.lopez",
        email: "ana.lopez@pintaisla.art",
        password: "Customer@12345",
      },
      t
    );
    await CustomerProfile.create(
      { userId: customer.id, address: "123 Rizal St.", city: "Iloilo City", province: "Iloilo" },
      { transaction: t }
    );

    await t.commit();

    console.log("\nSeed complete. Demo accounts (all marked isSeed: true):\n");
    console.log("  Admin:    admin@pintaisla.art / Admin@12345");
    console.log("  Artist:   mara.delacruz@pintaisla.art / Artist@12345 (verified, approved)");
    console.log("  Artist:   jun.santos@pintaisla.art / Artist@12345 (verified, approved)");
    console.log("  Artist:   liwayway.reyes@pintaisla.art / Artist@12345 (approved)");
    console.log("  Artist:   ken.villareal@pintaisla.art / Artist@12345 (PENDING approval)");
    console.log("  Customer: ana.lopez@pintaisla.art / Customer@12345\n");
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error(err);
    process.exit(1);
  }
}

seed();
