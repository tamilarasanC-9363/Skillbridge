export const servicePricing = {
  Plumbing: {
    "Pipe Leakage Repair": { min: 500, max: 800 },
    "Tap / Faucet Repair": { min: 300, max: 600 },
    "Toilet Repair": { min: 400, max: 700 },
    "Drain Blockage": { min: 350, max: 650 },
    "Water Tank Installation": { min: 1000, max: 2000 },
    "Pipe Installation": { min: 800, max: 1500 }
  },

  Electrical: {
    "Wiring Installation": { min: 800, max: 2000 },
    "Light Installation": { min: 250, max: 500 },
    "Electrical Fault Repair": { min: 400, max: 800 },
    "Fan Installation/Repair": { min: 300, max: 700 },
    "Switch/Socket Repair": { min: 200, max: 400 },
    "MCB/DB Repair": { min: 500, max: 1000 }
  },

  Carpentry: {
    "Door Repair": { min: 400, max: 900 },
    "Door Installation": { min: 800, max: 1500 },
    "Furniture Repair": { min: 500, max: 1200 },
    "Cabinet Installation": { min: 700, max: 1500 },
    "Wardrobe Work": { min: 1500, max: 4000 },
    "Custom Furniture": { min: 2000, max: 6000 }
  },

  "Mason / Construction": {
    "Brick Wall Construction": { min: 1000, max: 3000 },
    "Wall Repair": { min: 500, max: 1200 },
    "Cement Work": { min: 800, max: 2000 },
    "Tile Installation": { min: 1000, max: 3000 },
    "Plastering": { min: 800, max: 2000 },
    "Concrete Work": { min: 1500, max: 4000 },
    "Demolition Work": { min: 1000, max: 3000 },
    "Construction Labor": { min: 600, max: 1200 }
  },

  Painting: {
    "Interior Wall Painting": { min: 1000, max: 3000 },
    "Exterior Painting": { min: 1500, max: 4000 },
    "Ceiling Painting": { min: 700, max: 1500 },
    "Repainting": { min: 800, max: 2500 },
    "Waterproof Coating": { min: 1000, max: 3000 }
  },

  Cleaning: {
    "Home Deep Cleaning": { min: 800, max: 1500 },
    "Bathroom Cleaning": { min: 300, max: 600 },
    "Kitchen Cleaning": { min: 400, max: 800 },
    "Office Cleaning": { min: 1000, max: 3000 },
    "Post-Construction Cleaning": { min: 1500, max: 4000 },
    "Water Tank Cleaning": { min: 500, max: 1000 }
  }
};

/**
 * Get dynamic estimated price range for a given category and job type.
 * Returns formatted string "₹Min – ₹Max".
 */
export function getEstimatedPrice(category, jobType) {
  if (servicePricing[category] && servicePricing[category][jobType]) {
    const { min, max } = servicePricing[category][jobType];
    return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  }
  return null;
}
