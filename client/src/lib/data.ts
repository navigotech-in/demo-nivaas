export const site = {
  name: "Indore House Maker's",
  tagline: "House plans, elevations & interiors by Indore's top architects",
  phone: '+91 731-6533888',
  whatsapp: '+91 91111 22334',
  email: 'care@indorehousemakers.in',
  city: 'Indore, MP & Pan-India',
  operatingHours: 'Mon-Sat, 9:30 AM - 7:00 PM IST',
}

export interface MegaMenuItem {
  title: string
  items: { label: string; href: string; badge?: string }[]
}

export const megaMenus: {
  architecture: MegaMenuItem[]
  interior: MegaMenuItem[]
  designIdeas: { label: string; href: string; desc: string }[]
  otherServices: { label: string; href: string; desc: string }[]
  resources: { label: string; href: string }[]
} = {
  architecture: [
    {
      title: 'Architectural Styles',
      items: [
        { label: 'Modern Contemporary', href: '#elevations', badge: 'Hot' },
        { label: 'Kerala Traditional', href: '#elevations' },
        { label: 'Neo-Classical / European', href: '#elevations' },
        { label: 'Minimalist Zen & Glass', href: '#elevations' },
        { label: 'Mediterranean Villa', href: '#elevations' },
        { label: 'Rajasthani & Haveli Fusion', href: '#elevations' },
        { label: 'Colonial & Heritage', href: '#elevations' },
        { label: 'Ultra Luxury Duplex', href: '#elevations', badge: 'Popular' },
      ],
    },
    {
      title: 'Storey & Elevation Types',
      items: [
        { label: 'Single Floor Ground Level', href: '#plans' },
        { label: 'G+1 Modern Duplex House', href: '#plans', badge: 'Trending' },
        { label: 'G+2 Triplex Villa Design', href: '#plans' },
        { label: 'Stilt + 3 Multi-Floor Unit', href: '#plans' },
        { label: 'Penthouse & Rooftop Terrace', href: '#plans' },
        { label: 'Sloped Roof & Courtyard', href: '#plans' },
      ],
    },
    {
      title: 'By Bedroom (BHK)',
      items: [
        { label: '1 BHK House Plans', href: '#plans' },
        { label: '2 BHK Compact Homes', href: '#plans' },
        { label: '3 BHK Modern Duplex', href: '#plans', badge: 'Trending' },
        { label: '4 BHK Luxury Villas', href: '#plans' },
        { label: '5 BHK Joint Family Homes', href: '#plans' },
        { label: '6 BHK Multi-Unit Estate', href: '#plans' },
      ],
    },
    {
      title: 'By Plot Facing (Vastu)',
      items: [
        { label: 'East Facing Plans (Purva)', href: '#plans', badge: 'Vastu' },
        { label: 'North Facing Plans (Uttar)', href: '#plans', badge: 'Vastu' },
        { label: 'West Facing Plans (Pashchim)', href: '#plans' },
        { label: 'South Facing Plans (Dakshin)', href: '#plans' },
        { label: 'North-East Corner (Ishan)', href: '#plans' },
        { label: 'South-East Corner (Agneya)', href: '#plans' },
      ],
    },
  ],
  interior: [
    {
      title: 'Living & Dining',
      items: [
        { label: 'Living Room Designs', href: '#interiors' },
        { label: 'Dining Hall Layouts', href: '#interiors' },
        { label: 'TV Unit & Wall Paneling', href: '#interiors' },
        { label: 'Lobby & Foyer Entry', href: '#interiors' },
        { label: 'False Ceiling & Lighting', href: '#interiors' },
      ],
    },
    {
      title: 'Bedrooms & Storage',
      items: [
        { label: 'Master Bedroom', href: '#interiors' },
        { label: 'Kids & Study Room', href: '#interiors' },
        { label: 'Walk-in Wardrobe & Closets', href: '#interiors' },
        { label: 'Guest Bedroom', href: '#interiors' },
        { label: 'Dressing Room', href: '#interiors' },
      ],
    },
    {
      title: 'Kitchen & Utility',
      items: [
        { label: 'Modular Kitchen (L-Shape/Island)', href: '#interiors' },
        { label: 'Pantry & Utility Area', href: '#interiors' },
        { label: 'Chimney & Hob Counters', href: '#interiors' },
        { label: 'Modern Bathrooms', href: '#interiors' },
        { label: 'Pooja Room & Mandir Vastu', href: '#interiors' },
      ],
    },
    {
      title: 'Luxury & Commercial',
      items: [
        { label: 'Home Theatre & Lounge', href: '#interiors' },
        { label: 'Home Bar & Terrace Garden', href: '#interiors' },
        { label: 'Office & Directors Cabin', href: '#interiors' },
        { label: 'Gym & Spa Suite', href: '#interiors' },
        { label: 'Courtyard & Indoor Green', href: '#interiors' },
      ],
    },
  ],
  designIdeas: [
    { label: 'Interior Design Gallery', href: '#interiors', desc: 'Over 5,000+ curated photo inspirations' },
    { label: '3D Front Elevations', href: '#elevations', desc: 'Modern, contemporary, colonial & minimal facades' },
    { label: 'Landscape & Terrace Gardens', href: '#interiors', desc: 'Balcony greens, rooftop gazebo and lawn layouts' },
    { label: 'Floor Plan Blueprints', href: '#plans', desc: 'Vastu compliant 2D working layouts with dimensions' },
    { label: 'Structural & Working Drawings', href: '#services', desc: 'Column layout, beam schedules, reinforcement details' },
    { label: '3D Walkthrough Videos', href: '#reviews', desc: 'Virtual immersive 360 degree walkthrough tours' },
  ],
  otherServices: [
    { label: 'Home Loan Assistance', href: '#contact', desc: 'Pre-approved loan sanction with leading partner banks' },
    { label: 'Verified Contractors & Labour', href: '#contact', desc: 'Hire licensed masons, electrical & plumbing contractors' },
    { label: 'Site Supervision & Quality Audit', href: '#services', desc: 'Site inspection & stage-wise structural audit' },
    { label: 'Vastu Consultation', href: '#contact', desc: 'Certified Astro-Vastu architects review your plot' },
    { label: 'Cost Estimator Calculator', href: '#calculator', desc: 'Instant material and labor budget breakdown' },
  ],
  resources: [
    { label: 'Professional Architects Directory', href: '#services' },
    { label: 'Client Design Stories', href: '#reviews' },
    { label: 'Architecture & Vastu Blogs', href: '#blog' },
    { label: 'Indore House Maker\'s Design Magazine', href: '#blog' },
    { label: 'Architectural Explainer Videos', href: '#reviews' },
    { label: 'Live Webinar & Home Planning masterclasses', href: '#contact' },
  ],
}

export const navLinks = [
  { label: 'House Plans', href: '#plans' },
  { label: 'Elevations', href: '#elevations' },
  { label: 'Interiors', href: '#interiors' },
  { label: 'Services', href: '#services' },
  { label: 'Cost Estimator', href: '#calculator' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Blogs', href: '#blog' },
  { label: 'FAQ', href: '#faq' },
]

export interface Project {
  id: string
  title: string
  size: string
  bhk: string
  floors: string
  facing: string
  city?: string
  area: string
  price: string
  image: string
  planImage?: string
  tag?: string
  featured?: boolean
  vastuCompliant?: boolean
  dimension: string
  plotDetails?: string
  keyFeatures?: string[]
}

export const fallbackProjects: Project[] = [
  {
    id: 'p1',
    title: '30 x 50 ft Modern Indian Duplex (G+1)',
    size: '30 x 50 ft',
    dimension: '30x50',
    city: 'Hyderabad',
    bhk: '3 BHK + Pooja',
    floors: 'G+1 Duplex with Car Porch',
    facing: 'East Facing (Purva Vastu)',
    area: '2,175 sq.ft Built-up',
    price: '₹4,999',
    image: img('https://images.pexels.com/photos/31737861/pexels-photo-31737861.jpeg'),
    tag: 'Best Seller in India',
    featured: true,
    vastuCompliant: true,
    plotDetails: '167 Sq. Yards (1500 sq.ft plot) · 30ft Road Facing',
    keyFeatures: ['Covered Car Porch & Portico', 'NE Ishan Pooja Room', 'SE Agneya Modular Kitchen', 'Open Balcony with Glass Railing'],
  },
  {
    id: 'p2',
    title: '20 x 40 ft Smart Urban Duplex (G+1)',
    size: '20 x 40 ft',
    dimension: '20x40',
    city: 'Pune',
    bhk: '2 BHK + Study',
    floors: 'G+1 with Bike & Car Space',
    facing: 'North Facing (Kubera Vastu)',
    area: '1,420 sq.ft Built-up',
    price: '₹3,999',
    image: img('https://images.pexels.com/photos/7031412/pexels-photo-7031412.jpeg'),
    tag: 'Compact Plot Special',
    vastuCompliant: true,
    plotDetails: '88 Sq. Yards (800 sq.ft plot) · Narrow Frontage',
    keyFeatures: ['Compact Staircase with Skylight', 'Utility Wash Area', 'Parent Bedroom on Ground Floor', 'Rooftop Mumty & Terrace'],
  },
  {
    id: 'p3',
    title: '40 x 60 ft Courtyard Haveli Bungalow (G+2)',
    size: '40 x 60 ft',
    dimension: '40x60',
    city: 'Jaipur',
    bhk: '4 BHK + Home Theatre',
    floors: 'G+2 Luxury Residence',
    facing: 'North-East (Ishan Vastu)',
    area: '3,650 sq.ft Built-up',
    price: '₹8,499',
    image: img('https://images.pexels.com/photos/33692974/pexels-photo-33692974.jpeg'),
    tag: 'Courtyard Haveli',
    vastuCompliant: true,
    plotDetails: '266 Sq. Yards (2400 sq.ft plot) · Corner Plot',
    keyFeatures: ['Central Open Brahmasthan Courtyard', 'Double-Height Living Hall', 'Dual Covered Car Garage', 'Servant Quarter with Separate Entry'],
  },
  {
    id: 'p4',
    title: '25 x 50 ft G+2 Multi-Unit Rental & Residence',
    size: '25 x 50 ft',
    dimension: '25x50',
    city: 'Delhi NCR',
    bhk: '4 BHK (Rental + Duplex)',
    floors: 'G+2 Multi-Family / High Yield',
    facing: 'East Facing (Purva Vastu)',
    area: '2,850 sq.ft Built-up',
    price: '₹5,999',
    image: img('https://images.pexels.com/photos/33034471/pexels-photo-33034471.jpeg'),
    tag: 'Rental Income Design',
    vastuCompliant: true,
    plotDetails: '138 Sq. Yards (1250 sq.ft plot) · Urban Row House',
    keyFeatures: ['Ground Floor 1BHK Rental Unit', 'Upper 3BHK Duplex for Self-Use', 'Independent Water & Electric Meters', 'Exterior Staircase Access'],
  },
  {
    id: 'p5',
    title: '30 x 40 ft Kerala Sloping Roof Tropical Villa',
    size: '30 x 40 ft',
    dimension: '30x40',
    city: 'Bengaluru',
    bhk: '3 BHK + Sit-out Verandah',
    floors: 'G+1 Kerala Style House',
    facing: 'East Facing (Purva Vastu)',
    area: '1,890 sq.ft Built-up',
    price: '₹4,499',
    image: img('https://images.pexels.com/photos/14582265/pexels-photo-14582265.jpeg'),
    tag: 'Kerala Traditional',
    vastuCompliant: true,
    plotDetails: '133 Sq. Yards (1200 sq.ft plot) · Heavy Rainfall Climate',
    keyFeatures: ['Mangalore Clay Tile Pitched Roof', 'Charupadi Wooden Sit-out Bench', 'Cross-Ventilated Living & Dining', 'Rainwater Harvesting Pitches'],
  },
  {
    id: 'p6',
    title: '50 x 80 ft Royal Grand Estate with Stilt (G+2)',
    size: '50 x 80 ft',
    dimension: '50x80',
    city: 'Indore',
    bhk: '5 BHK + Private Gym + Lift',
    floors: 'G+2 Grand Indian Mansion',
    facing: 'North-East (Ishan Vastu)',
    area: '5,400 sq.ft Built-up',
    price: '₹12,999',
    image: img('https://images.pexels.com/photos/34147166/pexels-photo-34147166.jpeg'),
    tag: 'Royal Estate Series',
    featured: true,
    vastuCompliant: true,
    plotDetails: '444 Sq. Yards (4000 sq.ft plot) · Private Gated Plot',
    keyFeatures: ['Stilt Parking for 4 Cars', 'Private Hydraulic Home Lift', 'Landscaped Rooftop Gazebo & Lawn', 'Master Suite with Walk-in Wardrobe'],
  },
  {
    id: 'p7',
    title: '30 x 45 ft Neo-Classical Sea-Breeze Villa (G+1)',
    size: '30 x 45 ft',
    dimension: '30x45',
    city: 'Mumbai',
    bhk: '3 BHK + Terrace Garden',
    floors: 'G+1 Coastal Villa',
    facing: 'West Facing (Pashchim Vastu)',
    area: '2,100 sq.ft Built-up',
    price: '₹5,499',
    image: img('https://images.pexels.com/photos/32520271/pexels-photo-32520271.jpeg'),
    tag: 'Modern Coastal',
    vastuCompliant: true,
    plotDetails: '150 Sq. Yards (1350 sq.ft plot) · Coastal Climate',
    keyFeatures: ['Weather-Resistant Grooved Facade', 'Deep Shaded Verandah', 'Cross-Ventilated Living Hall', 'Terrace Pergola with Deck'],
  },
  {
    id: 'p8',
    title: '35 x 60 ft Premium Commercial & Residence (G+2)',
    size: '35 x 60 ft',
    dimension: '35x60',
    city: 'Ahmedabad',
    bhk: '4 BHK (Shops + Duplex)',
    floors: 'G+2 Mixed-Use',
    facing: 'North Facing (Kubera Vastu)',
    area: '3,800 sq.ft Built-up',
    price: '₹7,999',
    image: img('https://images.pexels.com/photos/34188579/pexels-photo-34188579.jpeg'),
    tag: 'Commercial + Home',
    vastuCompliant: true,
    plotDetails: '233 Sq. Yards (2100 sq.ft plot) · Main Road Plot',
    keyFeatures: ['Ground Floor Commercial Showrooms', 'Upper Luxury Duplex Residence', 'Dedicated Lift Core', 'Dual Parking Bays'],
  },
  {
    id: 'p9',
    title: '25 x 40 ft Contemporary Tropical Duplex',
    size: '25 x 40 ft',
    dimension: '25x40',
    city: 'Kochi',
    bhk: '3 BHK + Balcony Garden',
    floors: 'G+1 Modern Villa',
    facing: 'East Facing (Purva Vastu)',
    area: '1,650 sq.ft Built-up',
    price: '₹4,299',
    image: img('https://images.pexels.com/photos/35361412/pexels-photo-35361412.jpeg'),
    tag: 'Tropical Zen',
    vastuCompliant: true,
    plotDetails: '111 Sq. Yards (1000 sq.ft plot) · Green Setbacks',
    keyFeatures: ['Wooden Louver Shading', 'Open Plan Dining with Courtyard', 'Rainwater Harvesting Chamber', 'Glass Railing Balcony'],
  },
  {
    id: 'p10',
    title: '40 x 50 ft Grand Joint Family Residence (G+2)',
    size: '40 x 50 ft',
    dimension: '40x50',
    city: 'Lucknow',
    bhk: '5 BHK + Home Theatre + Lift',
    floors: 'G+2 Royal Bungalow',
    facing: 'North-East (Ishan Vastu)',
    area: '4,200 sq.ft Built-up',
    price: '₹9,499',
    image: img('https://images.pexels.com/photos/36966878/pexels-photo-36966878.jpeg'),
    tag: 'Luxury Heritage',
    vastuCompliant: true,
    plotDetails: '222 Sq. Yards (2000 sq.ft plot) · Wide Frontage',
    keyFeatures: ['Grand Double-Height Foyer', 'Pooja Room with Sky Dome', 'Servant Quarters with Bath', 'Covered Portico for 2 SUVs'],
  },
]

export const elevations = [
  {
    id: 'elevation-1',
    title: 'Modern Indian Duplex Facade (Wooden Louvers & CNC Jali)',
    text: 'Sleek horizontal grooves, exterior HPL wooden rafters, warm ambient LED profile lighting, toughened glass balconies, and automated compound gate.',
    image: img('https://images.pexels.com/photos/35361412/pexels-photo-35361412.jpeg'),
    badge: 'Most Popular in India',
    bhks: [2, 3, 4],
    homeTypes: ['Compact Home', 'Duplex', 'Joint Family Home'],
    builtUpAreaRange: { min: 800, max: 3000 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'elevation-2',
    title: 'Kerala Traditional & Contemporary Sloping Roof Villa',
    text: 'Pitched Mangalore clay tiles, teak wood pillars, wide charupadi verandah sit-out, and weather-resistant textures designed for tropical climates.',
    image: img('https://images.pexels.com/photos/32520271/pexels-photo-32520271.jpeg'),
    badge: 'Traditional & Tropical',
    bhks: [2, 3, 4, 5],
    homeTypes: ['Compact Home', 'Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 1000, max: 5000 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'elevation-3',
    title: 'North Indian G+2 Multi-Storey Floors (Stilt Parking & Lift)',
    text: 'Ground stilt parking with dual car bays, Italian marble tile cladding, glass railing projections, exterior lift column, and staircase Mumty head.',
    image: img('https://images.pexels.com/photos/34188579/pexels-photo-34188579.jpeg'),
    badge: 'Rental + Luxury',
    bhks: [3, 4, 5],
    homeTypes: ['Luxury Villa', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 2500, max: 6000 },
    vastuDirections: ['East Facing', 'North Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'elevation-4',
    title: 'Rajasthan Dholpur Sandstone & Courtyard Haveli Bungalow',
    text: 'Natural warm stone textures, decorative carved jali screens, grand entrance portico, and internal open-sky Brahmasthan courtyard ventilation.',
    image: img('https://images.pexels.com/photos/36966878/pexels-photo-36966878.jpeg'),
    badge: 'Heritage Luxury',
    bhks: [4, 5],
    homeTypes: ['Luxury Villa', 'Joint Family Home'],
    builtUpAreaRange: { min: 3000, max: 6500 },
    vastuDirections: ['North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
]

export const mediaLogos = [
  { name: 'YourStory', tag: 'Featured Startup', desc: 'Transforming Indian residential architecture with technology' },
  { name: 'Zee Business', tag: 'Top Innovator', desc: 'Online architecture simplifies home construction across 60+ cities' },
  { name: 'NDTV', tag: 'Special Coverage', desc: 'How custom 3D house plans save lakhs on on-site construction errors' },
  { name: 'The Pioneer', tag: 'Industry Voice', desc: 'Next-gen floor planning tailored for Indian plot sizes' },
  { name: 'Outlook Magazine', tag: 'Feature Story', desc: 'Affordable architecture for urban & Tier-2 home builders' },
  { name: 'DNA India', tag: 'Spotlight', desc: 'The digital blueprint revolutionizing residential housing' },
]

export interface ReviewItem {
  id: string
  name: string
  city: string
  stars: number
  quote: string
  plotSize: string
  youtubeId: string
  avatar: string
  service: string
}

export const clientReviews: ReviewItem[] = [
  {
    id: 'r1',
    name: 'Mr. Bhupendra Parmar',
    city: 'Ahmedabad, Gujarat',
    stars: 5,
    quote: 'Excellent coordination, expertise and professional support throughout our 30x50 duplex design journey. Every room was planned with perfect Vastu.',
    plotSize: '30 x 50 ft · 3 BHK',
    youtubeId: 'zoLON_OY6vk',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    service: 'Full House Plan & 3D Elevation',
  },
  {
    id: 'r2',
    name: 'Mr. Aashish Bhanwala',
    city: 'Gurugram, Haryana',
    stars: 5,
    quote: 'The team was really professional. The working drawings and plumbing-electrical layouts made contractor execution completely stress-free.',
    plotSize: '40 x 60 ft · 4 BHK',
    youtubeId: 'mx6HvcIMy84',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    service: 'Architecture & Turnkey Supervision',
  },
  {
    id: 'r3',
    name: 'Kiran Bakul Sharma',
    city: 'Indore, Madhya Pradesh',
    stars: 5,
    quote: 'All team members supported us like family. Revisions were incorporated smoothly and the 3D elevation looks even better in real life!',
    plotSize: '25 x 50 ft · 3 BHK',
    youtubeId: 'E97yzS8V4Og',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    service: 'Complete Architecture & Interior',
  },
  {
    id: 'r4',
    name: 'Rahul Macwan',
    city: 'Mumbai, Maharashtra',
    stars: 5,
    quote: 'They accommodated our specific joint family requirements without compromising privacy or modern looks. Highly recommended.',
    plotSize: '35 x 65 ft · 5 BHK',
    youtubeId: '9eBcmnDjKJ0',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    service: '3D Elevation & Structural Drawing',
  },
  {
    id: 'r5',
    name: 'Mr. Ajay Menariya',
    city: 'Chittorgarh, Rajasthan',
    stars: 5,
    quote: 'Cost effectiveness along with thorough structural detailing and active guidance. Saved us at least ₹3 Lakhs in steel and cement wastage.',
    plotSize: '30 x 60 ft · 3 BHK',
    youtubeId: 'Y3MXVFMrnYo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    service: 'Floor Plan & Structural Analysis',
  },
  {
    id: 'r6',
    name: 'Anwar Basha',
    city: 'Visakhapatnam, AP',
    stars: 5,
    quote: 'Quality and communication both were top tier. Delivered 2D plans and 3D renders on time as promised in 5 working days.',
    plotSize: '20 x 40 ft · 2 BHK',
    youtubeId: 'a5fWHQG1U18',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    service: '2D Layout & 3D Front Elevation',
  },
]

export const serviceCards = [
  {
    id: 'pmc',
    title: 'Project Management & PMC',
    tagline: 'End-to-end site governance',
    desc: 'Dedicated site engineers supervise contractors, check concrete cube strengths, verify bills and ensure zero budget overruns.',
    icon: 'briefcase',
    badge: 'Most Comprehensive',
    features: ['Weekly on-site audit', 'Contractor billing verification', 'Material quality testing', 'Timeline guarantee'],
  },
  {
    id: 'arch-consult',
    title: 'Architect Consultation',
    tagline: '1-on-1 with senior architects',
    desc: 'Live video consultations with licensed architects to discuss plot zoning, local municipal bylaws, sunlight orientation and space planning.',
    icon: 'compass',
    badge: 'Popular',
    features: ['Instant design review', 'Plot feasibility check', 'Bylaws & setback guidance', 'Custom layout concept'],
  },
  {
    id: 'site-supervision',
    title: 'Site Supervision & Audit',
    tagline: 'Quality checks at key milestones',
    desc: 'Critical milestone visits during column casting, lintel level, slab rebar binding and brickwork alignment to prevent execution flaws.',
    icon: 'shield-check',
    badge: 'Safety First',
    features: ['Rebar binding inspection', 'Slab casting supervision', 'Curing & plumb line check', 'Defect report report'],
  },
  {
    id: 'vastu-camp',
    title: 'Vastu Shastra Consultation',
    tagline: 'Traditional balance with modern life',
    desc: 'Astro-Vastu certified specialists balance Brahmasthan, kitchen Agni zone, master bedroom Nairuthi corner and water tank placement.',
    icon: 'sun',
    badge: '100% Vastu',
    features: ['Compass degree alignment', 'Zone-wise energy map', 'Remedies without demolition', 'Main entrance optimization'],
  },
  {
    id: 'interior-design',
    title: 'Complete Interior Design',
    tagline: 'Concept to turnkey carpentry',
    desc: 'Photo-realistic 3D interior renders, modular kitchen plans, custom wardrobes, electrical lighting layouts and material specifications.',
    icon: 'home',
    badge: '3D Walkthrough',
    features: ['3D renders every room', 'Modular kitchen detailed layout', 'False ceiling & lighting drawings', 'Carpenter cutting list'],
  },
  {
    id: 'structural-drawing',
    title: 'Structural & Working Drawings',
    tagline: 'Earthquake-resistant safe engineering',
    desc: 'Certified structural engineer drawings: footing, column centerlines, beam reinforcement, slab details, plumbing and electrical CAD sets.',
    icon: 'layers',
    badge: 'Engineering Set',
    features: ['Earthquake Zone analysis', 'Steel bar bending schedule (BBS)', 'Soil-bearing footing design', 'Complete MEP drawings'],
  },
]

export const trendingTabs = {
  byArea: [
    { label: '800 - 1100 sq.ft (Compact)', size: '20 x 40 / 25 x 40 ft', bhk: '2 BHK Duplex', img: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg', price: '₹3,999' },
    { label: '1200 - 1500 sq.ft (Standard)', size: '30 x 40 / 25 x 50 ft', bhk: '3 BHK Duplex', img: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg', price: '₹4,499' },
    { label: '1500 - 2200 sq.ft (Popular)', size: '30 x 50 / 30 x 60 ft', bhk: '3 BHK + Pooja', img: 'https://images.pexels.com/photos/19510801/pexels-photo-19510801.jpeg', price: '₹4,999' },
    { label: '2200 - 3200 sq.ft (Spacious)', size: '35 x 60 / 40 x 60 ft', bhk: '4 BHK Duplex', img: 'https://images.pexels.com/photos/38794776/pexels-photo-38794776.jpeg', price: '₹6,999' },
    { label: '3200 - 4500 sq.ft (Luxury)', size: '40 x 70 / 50 x 70 ft', bhk: '4 BHK Haveli', img: 'https://images.pexels.com/photos/29120121/pexels-photo-29120121.jpeg', price: '₹8,999' },
    { label: '4500+ sq.ft Grand Mansion', size: '50 x 80 / 60 x 90 ft', bhk: '5 BHK + Gym', img: 'https://images.pexels.com/photos/35289099/pexels-photo-35289099.jpeg', price: '₹12,999' },
  ],
  byBHK: [
    { label: '1 BHK Compact & Rental Units', size: '15 x 40 / 20 x 30 ft', bhk: '1 BHK Studio', img: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg', price: '₹2,999' },
    { label: '2 BHK Independent Duplex', size: '20 x 40 / 25 x 40 ft', bhk: '2 BHK Home', img: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg', price: '₹3,999' },
    { label: '3 BHK Modern Duplex with Pooja', size: '30 x 40 / 30 x 50 ft', bhk: '3 BHK Duplex', img: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg', price: '₹4,999' },
    { label: '4 BHK Multi-Generation Villa', size: '35 x 60 / 40 x 60 ft', bhk: '4 BHK Villa', img: 'https://images.pexels.com/photos/38794776/pexels-photo-38794776.jpeg', price: '₹6,999' },
    { label: '5 BHK Joint Family Estate', size: '40 x 70 / 50 x 80 ft', bhk: '5 BHK Palace', img: 'https://images.pexels.com/photos/35289099/pexels-photo-35289099.jpeg', price: '₹9,999' },
    { label: 'G+3 Multi-Floor Rental Building', size: '30 x 50 / 40 x 60 ft', bhk: 'Rental Floors', img: 'https://images.pexels.com/photos/19510801/pexels-photo-19510801.jpeg', price: '₹14,999' },
  ],
  byDirection: [
    { label: 'East Facing (Purva Vastu)', size: 'All plot dimensions', bhk: 'Most Auspicious', img: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg', price: 'From ₹3,999' },
    { label: 'North Facing (Uttar - Kubera)', size: 'All plot dimensions', bhk: 'Wealth & Prosperity', img: 'https://images.pexels.com/photos/38794776/pexels-photo-38794776.jpeg', price: 'From ₹3,999' },
    { label: 'West Facing (Pashchim Vastu)', size: 'All plot dimensions', bhk: 'Varuna Positive Flow', img: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg', price: 'From ₹3,999' },
    { label: 'South Facing (Special Vastu)', size: 'Specialized Indian Layouts', bhk: 'Yama Strength Bal.', img: 'https://images.pexels.com/photos/19510801/pexels-photo-19510801.jpeg', price: 'From ₹4,499' },
    { label: 'North-East Corner (Ishan)', size: 'Corner Plots', bhk: 'Divine Sunlight Orientation', img: 'https://images.pexels.com/photos/35289099/pexels-photo-35289099.jpeg', price: 'From ₹4,999' },
    { label: 'South-East Corner (Agneya)', size: 'Corner Plots', bhk: 'Kitchen Energy Flow', img: 'https://images.pexels.com/photos/29120121/pexels-photo-29120121.jpeg', price: 'From ₹4,999' },
  ],
  byLocation: [
    { label: 'Hyderabad & Telangana', size: 'GHMC Bylaws Compliant', bhk: '250+ Live Projects', img: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg', price: 'Verified Local Codes' },
    { label: 'Bengaluru & Karnataka', size: 'BBMP & BDA Setback Norms', bhk: '320+ Live Projects', img: 'https://images.pexels.com/photos/38794776/pexels-photo-38794776.jpeg', price: 'Verified Local Codes' },
    { label: 'Delhi NCR & Haryana', size: 'DDA & HUDA Compliant', bhk: '280+ Live Projects', img: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg', price: 'Verified Local Codes' },
    { label: 'Mumbai & Pune', size: 'MCGM & PMRDA Norms', bhk: '210+ Live Projects', img: 'https://images.pexels.com/photos/19510801/pexels-photo-19510801.jpeg', price: 'Verified Local Codes' },
    { label: 'Indore & Central India', size: 'T&CP & Municipal Rules', bhk: '450+ Live Projects', img: 'https://images.pexels.com/photos/35289099/pexels-photo-35289099.jpeg', price: 'Verified Local Codes' },
    { label: 'Kerala & Tamil Nadu', size: 'LSGD & CMDA Rules', bhk: '190+ Live Projects', img: 'https://images.pexels.com/photos/29120121/pexels-photo-29120121.jpeg', price: 'Verified Local Codes' },
  ],
}

export const interiorCategories = [
  {
    id: 'interior-1',
    title: 'Indian Living & Drawing Rooms',
    text: 'TV unit paneling with warm ambient backlights, brass partition screens, foyer shoe console, and cross ventilation.',
    image: img('https://images.pexels.com/photos/33559373/pexels-photo-33559373.jpeg'),
    items: '850+ Designs',
    bhks: [2, 3, 4, 5],
    homeTypes: ['Compact Home', 'Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 800, max: 3500 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'interior-2',
    title: 'Ergonomic Indian Modular Kitchens',
    text: 'L-shape, Parallel and Island kitchens with stainless steel tandem boxes, spice racks, chimney ducting, and utility wash space.',
    image: img('https://images.pexels.com/photos/34993898/pexels-photo-34993898.jpeg'),
    items: '620+ Designs',
    bhks: [2, 3, 4, 5],
    homeTypes: ['Compact Home', 'Duplex', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 700, max: 3000 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'interior-3',
    title: 'Vastu Compliant Pooja Rooms & Mandir',
    text: 'North-East Ishan orientation, backlit CNC om & mandala jali screens, brass diya alcoves, and dedicated bell hanging points.',
    image: img('https://images.pexels.com/photos/37091429/pexels-photo-37091429.jpeg'),
    items: '310+ Designs',
    bhks: [2, 3, 4, 5],
    homeTypes: ['Compact Home', 'Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 750, max: 3500 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'interior-4',
    title: 'Master Bedrooms with Balcony Access',
    text: 'Full height floor-to-ceiling wardrobes, cushioned headboards, study workstation, and sliding glass balcony access.',
    image: img('https://images.pexels.com/photos/31925619/pexels-photo-31925619.jpeg'),
    items: '940+ Designs',
    bhks: [3, 4, 5],
    homeTypes: ['Duplex', 'Luxury Villa', 'Joint Family Home'],
    builtUpAreaRange: { min: 1200, max: 4500 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'interior-5',
    title: 'Modern Indian Bathrooms with Dry/Wet Zones',
    text: 'Glass shower partitions, concealed diverters, anti-skid floor tiles, and exhaust ventilation alcoves.',
    image: img('https://images.pexels.com/photos/33599113/pexels-photo-33599113.jpeg'),
    items: '480+ Designs',
    bhks: [2, 3, 4, 5],
    homeTypes: ['Compact Home', 'Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 700, max: 3000 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
  {
    id: 'interior-6',
    title: 'Terrace Garden, Pergola & Balcony Greens',
    text: 'Weather-proof wooden pergolas, artificial turf zones, vertical planter walls, and swing (jhula) relaxation corners.',
    image: img('https://images.pexels.com/photos/31485002/pexels-photo-31485002.jpeg'),
    items: '290+ Designs',
    bhks: [3, 4, 5],
    homeTypes: ['Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units'],
    builtUpAreaRange: { min: 1400, max: 5000 },
    vastuDirections: ['East Facing', 'North Facing', 'West Facing', 'South Facing'],
    cities: ['Hyderabad', 'Bengaluru', 'Delhi NCR', 'Pune', 'Mumbai', 'Jaipur', 'Indore', 'Ahmedabad', 'Kochi', 'Lucknow'],
  },
]

export const faqList = [
  {
    q: 'What is Indore House Maker\'s and how does it work?',
    a: 'Indore House Maker\'s is India\'s leading residential architecture and engineering platform. You can discover ready-to-build house plans, 3D front elevations, and interior designs or commission our licensed architects for full custom drawings tailored to your exact plot dimensions and budget.',
    tag: 'General',
  },
  {
    q: 'How long does it take to receive my custom house design?',
    a: 'Standard 2D floor plans are delivered in 3-5 working days. Full architectural packages including 3D front elevations, structural drawings, and plumbing/electrical CAD sets are completed in 7-10 working days with revisions included.',
    tag: 'Delivery',
  },
  {
    q: 'What is included in a complete Indore House Maker\'s Architectural Package?',
    a: 'Our standard packages include: 2D Furniture Layout Plan, Detailed Room Dimensions, North Orientation & Vastu Analysis, 3D Elevation Views, Column Centerline Drawings, Footing & Beam Structural Reinforcement Schedules, and Electrical & Plumbing working drawings.',
    tag: 'Deliverables',
  },
  {
    q: 'Are your house plans 100% compliant with Vastu Shastra?',
    a: 'Yes. All our standard and custom floor plans are designed under the guidance of certified Vastu architects, ensuring auspicious placement for the Main Entrance, Kitchen (Agni), Master Bedroom (Nairuthi), Pooja Room (Ishan), and Staircases.',
    tag: 'Vastu',
  },
  {
    q: 'Can I customize a ready house plan to fit my plot?',
    a: 'Absolutely! Click "Request Customization" on any plan. Our architects will modify room dimensions, add or remove floors, switch facing directions, or adjust the layout to fit your plot boundaries and municipal setback requirements.',
    tag: 'Customization',
  },
  {
    q: 'Does Indore House Maker\'s provide on-site supervision and construction support?',
    a: 'Yes. Through our PMC (Project Management Consultancy) and verified contractor network across Indore and 60+ Indian cities, we provide milestone-based on-site engineering supervision, material quality verification, and contractor matchmaking.',
    tag: 'Construction',
  },
  {
    q: 'How much does a house plan cost at Indore House Maker\'s?',
    a: 'Ready 2D floor plans start from ₹2,999. Complete custom architectural packages (2D Layout + 3D Elevation + Structural drawings) range from ₹7,999 to ₹24,999 depending on plot area, number of floors, and structural complexity.',
    tag: 'Pricing',
  },
  {
    q: 'How do I speak with an Indore House Maker\'s architect or design advisor?',
    a: 'You can click "Consult Online Now" in the top bar, call us at +91 731-6533888 (Mon-Sat, 9:30 AM - 7:00 PM IST), or message our design desk on WhatsApp for immediate assistance.',
    tag: 'Support',
  },
]

export const blogPosts = [
  {
    id: 'b1',
    category: 'Vastu Planning',
    tag: 'Bathroom Design',
    title: 'Placement of Bathrooms and Wet Areas: A Vastu-Friendly Practical Guide',
    excerpt: 'Simple rules to balance wet zones in modern apartments and independent duplexes without wasting space.',
    time: '2 days ago',
    image: img('https://images.pexels.com/photos/33599113/pexels-photo-33599113.jpeg'),
  },
  {
    id: 'b2',
    category: 'House Plans',
    tag: 'Joint Family',
    title: 'Planning a Joint Family Home with Double Living Rooms & Private Suites',
    excerpt: 'How thoughtful zoning gives elders comfort, parents privacy, and children space to grow.',
    time: '1 week ago',
    image: img('https://images.pexels.com/photos/17948134/pexels-photo-17948134.jpeg'),
  },
  {
    id: 'b3',
    category: 'Cost Estimation',
    tag: 'Budget 2026',
    title: 'House Construction Cost in India (2026): Per Sq.Ft Rate Breakdown',
    excerpt: 'Detailed rate analysis covering civil structure, steel, cement, flooring, electrical and premium finishes.',
    time: '2 weeks ago',
    image: img('https://images.pexels.com/photos/30592257/pexels-photo-30592257.jpeg'),
  },
  {
    id: 'b4',
    category: '3D Elevations',
    tag: 'Modern Facades',
    title: '15 Stunning 30x50 Front Elevation Designs That Look Twice Their Budget',
    excerpt: 'Wooden louvers, cantilever balconies, and warm ambient lighting ideas for Indian plots.',
    time: '3 weeks ago',
    image: img('https://images.pexels.com/photos/29120121/pexels-photo-29120121.jpeg'),
  },
]

export const browseBy = [
  {
    heading: 'By Area',
    hint: 'Plot sizes we design for',
    chips: ['20 x 30 ft', '25 x 40 ft', '30 x 40 ft', '30 x 50 ft', '40 x 60 ft', '50 x 80 ft'],
  },
  {
    heading: 'By BHK',
    hint: 'Bedrooms from one to many',
    chips: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK'],
  },
  {
    heading: 'By Direction',
    hint: 'Facing and Vastu orientation',
    chips: ['East facing', 'West facing', 'North facing', 'South facing', 'North-East', 'South-West'],
  },
  {
    heading: 'By Location',
    hint: 'Cities we work with today',
    chips: ['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Pune', 'Delhi NCR', 'Indore'],
  },
]

export const trends = [
  {
    title: 'Open-plan living is here to stay',
    text: 'Kitchens, dining and living rooms are merging into one light-filled space with a pooja corner that still gets its quiet.',
    image: img('https://images.pexels.com/photos/31485002/pexels-photo-31485002.jpeg'),
  },
  {
    title: 'Vastu made practical',
    text: 'Homeowners want Vastu that works with modern architectural planning, not against it.',
    image: img('https://images.pexels.com/photos/28627217/pexels-photo-28627217.jpeg'),
  },
  {
    title: 'Smaller plots, smarter storage',
    text: 'From the 20 x 30 plot to the compact duplex, built-in floor-to-ceiling storage is planned into the blueprint.',
    image: img('https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg'),
  },
]

export const platformStats = [
  { label: 'Projects Completed', value: '35,000+', suffix: 'Pan-India' },
  { label: 'Cities Served', value: '1,200+', suffix: 'Designs Delivered' },
  { label: 'Partner Offices', value: '80+', suffix: '& Growing' },
  { label: 'Homeowner Rating', value: '4.8★', suffix: 'Avg. Google Score' },
]

export const processSteps = [
  {
    step: '01',
    title: 'Share Your Plot Details',
    text: 'Tell us your plot size, facing, floors and budget. Our architects review zoning rules and Vastu orientation for free.',
    icon: 'blueprint',
    cta: 'Calculate My Estimate',
  },
  {
    step: '02',
    title: 'Get Plans & Cost Estimate',
    text: 'Receive 2D layouts, 3D elevations and structural drawings with a transparent per sq.ft cost breakdown within days.',
    icon: 'layers',
    cta: 'Browse Ready Plans',
  },
  {
    step: '03',
    title: 'Build With Site Supervision',
    text: 'Hand the drawings to our verified contractor network or take PMC supervision for milestone-wise quality audits.',
    icon: 'hardhat',
    cta: 'Consult a Supervisor',
  },
]

export const contractorTrades = [
  { title: 'Civil & Masonry', desc: 'Foundation, brickwork & plinth', icon: 'hardhat', image: img('https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg') },
  { title: 'Concrete & RCC', desc: 'Column, slab & beam casting', icon: 'building', image: img('https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg') },
  { title: 'Roofing & Waterproofing', desc: 'Slab treatments & terrace work', icon: 'shieldcheck', image: img('https://images.pexels.com/photos/8961026/pexels-photo-8961026.jpeg') },
  { title: 'Flooring & Tiling', desc: 'Vitrified, marble & anti-skid', icon: 'grid', image: img('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg') },
  { title: 'Electrical Wiring', desc: 'Concealed conduit & switchgear', icon: 'calculator', image: img('https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg') },
  { title: 'Plumbing & Sanitary', desc: 'CPVC lines, drainage & fixtures', icon: 'compass', image: img('https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg') },
  { title: 'Painting & Textures', desc: 'Puttis, weather-proof & designer', icon: 'sun', image: img('https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg') },
  { title: 'False Ceiling & Carpentry', desc: 'POP, gypsum & modular units', icon: 'sofa', image: img('https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg') },
  { title: 'Landscape & Garden', desc: 'Lawns, planters & pergolas', icon: 'home', image: img('https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg') },
  { title: 'Solar & Rainwater', desc: 'Roof solar, harvest & sump lines', icon: 'layers', image: img('https://images.pexels.com/photos/9875416/pexels-photo-9875416.jpeg') },
]

export const oneStopServices = [
  {
    id: 'pmc',
    title: 'Project Management',
    icon: 'briefcase',
    desc: 'Single-point accountability from drawings to handover — budget, billing, contractors and quality all governed by one team.',
    link: '#services',
    cta: 'Explore PMC',
  },
  {
    id: 'turnkey',
    title: 'Turnkey Construction',
    icon: 'building',
    desc: 'Give us the keys to your plot. We handle every trade, every material bill and every milestone under a fixed-price contract.',
    link: '#contact',
    cta: 'Get Fixed Quote',
  },
  {
    id: 'contractors',
    title: 'Contractors & Labour',
    icon: 'hardhat',
    desc: 'A vetted network of licensed masons, electricians, plumbers and interior carpenters ready for on-demand engagement.',
    link: '#contractors',
    cta: 'Hire a Contractor',
  },
  {
    id: 'homeloan',
    title: 'Home Loan Assistance',
    icon: 'calculator',
    desc: 'Documentation support and pre-approved sanctions through partner banks for construction, plot purchase and interiors.',
    link: '#contact',
    cta: 'Check Eligibility',
  },
]

export const commercialTabs = [
  {
    id: 'commercial',
    label: 'Commercial',
    desc: 'Shops, showrooms & office blocks with parking norms and signage-ready facades.',
    image: img('https://images.pexels.com/photos/258160/pexels-photo-258160.jpeg'),
  },
  {
    id: 'institutional',
    label: 'Institutional',
    desc: 'Schools, clinics, banks and community halls with crowd-flow and safety planning.',
    image: img('https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg'),
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    desc: 'Budget lodges, homestays and farmhouses with service zones and guest privacy.',
    image: img('https://images.pexels.com/photos/29120121/pexels-photo-29120121.jpeg'),
  },
  {
    id: 'residential',
    label: 'Residential + Rental',
    desc: 'Multi-unit rentals, G+3 floors and mixed-use schemes for steady rental yield.',
    image: img('https://images.pexels.com/photos/38794776/pexels-photo-38794776.jpeg'),
  },
]

export const quickAnswers = [
  {
    q: 'Can I build from an Indore House Maker\'s plan in my city?',
    a: 'Yes — plans are code-compliant and our architects help with local municipal approvals.',
    tag: 'Approvals',
  },
  {
    q: 'Do you provide structural engineers?',
    a: 'Yes, every package includes certified structural drawing sets.',
    tag: 'Engineering',
  },
  {
    q: 'What is the fastest delivery time?',
    a: 'Ready 2D plans download instantly; custom drawings take 3-7 days.',
    tag: 'Delivery',
  },
  {
    q: 'Do you sell land or construction material?',
    a: 'No — we focus purely on design, engineering and supervision.',
    tag: 'Scope',
  },
]

export const achievements = [
  { title: 'Startup of the Year 2025', org: 'Architecture & Design Summit' },
  { title: 'Top PropTech Platform', org: 'Realty+ India Awards' },
  { title: "India's Most Trusted Design Brand", org: 'Consumer Choice Award' },
  { title: 'Best Online Architectural Service', org: 'National Design Council' },
]

export const ventures = [
  { name: 'Indore House Maker\'s Studio', tag: 'Interior Design' },
  { name: 'Indore House Maker\'s Construction', tag: 'PMC & Build' },
  { name: 'Indore House Maker\'s Finance', tag: 'Home Loans' },
  { name: 'Indore House Maker\'s Commerce', tag: 'Materials' },
  { name: 'Indore House Maker\'s Academy', tag: 'Site Training' },
  { name: 'Indore House Maker\'s AI', tag: 'AI Design Desk' },
]

export const paymentPartners = ['Razorpay', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Paytm', 'UPI']

export function img(url: string): string {
  if (url.includes('images.pexels.com')) {
    return url + '?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop'
  }
  return url + '?auto=format&fit=crop&w=1200&q=75'
}