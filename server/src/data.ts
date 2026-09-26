export interface DemoDesign {
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
  tag?: string
  vastuCompliant?: boolean
  dimension: string
  plotDetails?: string
  keyFeatures?: string[]
}

const img = (url: string) =>
  url.includes('images.pexels.com')
    ? `${url}?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop`
    : `${url}?auto=format&fit=crop&w=1200&q=70`

// Demo catalog served by the API. Production data comes from PostgreSQL via
// Prisma; this keeps the client demo fully runnable with only Express.
export const demoDesigns: DemoDesign[] = [
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
    vastuCompliant: true,
    plotDetails: '444 Sq. Yards (4000 sq.ft plot) · Private Gated Plot',
    keyFeatures: ['Stilt Parking for 4 Cars', 'Private Hydraulic Home Lift', 'Landscaped Rooftop Gazebo & Lawn', 'Master Suite with Walk-in Wardrobe'],
  },
]