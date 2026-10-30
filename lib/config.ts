// Single place to edit all replaceable content.
export const SITE = {
  name: "iDeveloped Skills Academy",
  logo: "/images/logo.svg",
  email: "info@idevelopedskills.com",
  phone: "225.888.6828",
  city: "Baton Rouge, LA",
  address: "7126 Antioch Rd Baton Rouge, LA 70817",
};

export const NAV = [
  { label: "Home", href: "/" }, { label: "Team League Sign-Up", href: "#" },
  { label: "Individual League Sign-Up", href: "#" }, { label: "Training", href: "#" },
  { label: "Membership", href: "#" }, { label: "Camps", href: "#" },
  { label: "Gym Rental", href: "#" }, { label: "Gym Schedule", href: "#" },
  { label: "Day Pass", href: "#" }, { label: "Louisiana Hoosiers", href: "#" },
  { label: "Sponsorship", href: "#" }, { label: "Volleyball", href: "#" },
  { label: "Elite Summer Circuit", href: "#" }, { label: "Schedules", href: "#" },
  { label: "Contact", href: "/contact" },
];

// Replace slider-1.webp ... slider-7.webp in /public/images/slider/ (same names).
export const SLIDES = Array.from({ length: 7 }, (_, i) => ({
  src: `/images/slider/slider-${i + 1}.webp`,
  alt: `iDeveloped Skills Academy slide ${i + 1}`,
}));

export const MISSION =
  "iDeveloped Skills, we seek to provide the opportunity for the youth and adults of surrounding communities to come together in fellowship, using athletics as the foundation. Our vision is to create an atmosphere where people of all different ages and backgrounds can benefit from physical development in the sports of basketball, volleyball and other recreational activities, therefore creating a stronger bond in our community. Instilling confidence, character, discipline, and a strong work ethic in the young men and women of our community is our organization's primary mission.";

// Replace the files in /public/images/video/ or point to any URL.
export const VIDEOS = [
  { title: "Community Outreach", src: "/images/video/video-1.mp4", poster: "/images/video/poster-1.jpg" },
  { title: "Basketball", src: "/images/video/video-2.mp4", poster: "/images/video/poster-2.jpg" },
  { title: "Volleyball", src: "/images/video/video-3.mp4", poster: "/images/video/poster-3.jpg" },
];

export const ABOUT =
  "IDEVELOPED SKILLS ACADEMY is the agency that connects people to sports and education. Throughout its history, IDEVELOPED SKILLS ACADEMY has taken seriously its responsibility to improve the health, safety, environment, and quality of life for all citizens. Since 2014, IDEVELOPED SKILLS ACADEMY has reached many kids and parents to build a community through sports and education.";

// The first 6 navigation items appear in the main menu; the rest go under "More".
export const PRIMARY_COUNT = 6;
export const SOCIALS = ["Facebook", "Instagram", "YouTube"];
