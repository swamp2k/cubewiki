import { useState, useMemo, useEffect, useCallback } from "react";

// ─── SOURCE LABELS ───────────────────────────────────────────────────────────

const SOURCE = {
  SKY:   "☁️ Falls from the sky every ~4 seconds",
  SMELT: "🔥 Smelt Dirt Cube in Furnace",
  CRAFT: "⚗️ Crafted item",
  CRATE: "📦 Found in crates / towers",
  BOSS:  "💀 Boss drop",
  BUY:   "🛒 Shop / Researcher",
};

// ─── BASE CUBES (not crafted) ────────────────────────────────────────────────

const BASE_CUBES = {
  "Wood Cube":        { color: "#8B5E3C", source: SOURCE.SKY,   note: "Brown, falls from sky" },
  "Red Cube":         { color: "#E53935", source: SOURCE.SKY,   note: "Red, falls from sky" },
  "Blue Cube":        { color: "#1E88E5", source: SOURCE.SKY,   note: "Blue, falls from sky" },
  "Green Cube":       { color: "#43A047", source: SOURCE.SKY,   note: "Green, falls from sky" },
  "White Cube":       { color: "#EEEEEE", source: SOURCE.SKY,   note: "White, falls from sky" },
  "Dirt Cube":        { color: "#A1887F", source: SOURCE.SKY,   note: "Brown/dirt, falls from sky" },
  "Ice Cube":         { color: "#81D4FA", source: SOURCE.SKY,   note: "Light blue, falls from sky" },
  "Rock Cube":        { color: "#9E9E9E", source: SOURCE.SKY,   note: "Grey, falls from sky" },
  "Magenta Cube":     { color: "#E91E8C", source: SOURCE.SKY,   note: "Pink/magenta, falls from sky" },
  "Yellow Cube":      { color: "#FDD835", source: SOURCE.SKY,   note: "Yellow, falls from sky" },
  "Black Cube":       { color: "#424242", source: SOURCE.SKY,   note: "Black, falls from sky" },
  "Cyan Cube":        { color: "#00BCD4", source: SOURCE.SKY,   note: "Cyan, falls from sky" },
  "Iron":             { color: "#B0BEC5", source: SOURCE.SMELT, note: "Smelt Dirt Cube → Iron ore" },
  "Gold":             { color: "#FFD54F", source: SOURCE.SMELT, note: "Smelt Dirt Cube → Gold ore" },
  "Copper":           { color: "#FF7043", source: SOURCE.SMELT, note: "Smelt Dirt Cube → Copper ore" },
  "Steel":            { color: "#78909C", source: SOURCE.SMELT, note: "Smelt Iron + ? — recipe unknown" },
  "Titanium":         { color: "#90CAF9", source: SOURCE.CRATE, note: "Late-game ingot — source unknown" },
  "Pyrolite":         { color: "#FF5722", source: SOURCE.BOSS,  note: "Dropped by Pyrolite boss" },
  "Cryoide":          { color: "#B2EBF2", source: SOURCE.BOSS,  note: "Dropped by Cryoide boss" },
  "Lava Cube":        { color: "#FF6F00", source: SOURCE.CRATE, note: "Found in crates on fire islands" },
  "Glacier Cube":     { color: "#B3E5FC", source: SOURCE.CRATE, note: "Found in crates on ice islands" },
  "Cooled Lava Cube": { color: "#546E7A", source: SOURCE.CRATE, note: "Cooled lava — fire island crates" },
  "Pyrolite Cube":    { color: "#FF3D00", source: SOURCE.BOSS,  note: "Dropped by Pyrolite boss" },
  "Gunpowder Cube":   { color: "#616161", source: SOURCE.CRATE, note: "Found in crates" },
  "Burner":           { color: "#EF6C00", source: SOURCE.CRATE, note: "Tool found in crates / furnace area" },
  "Pack Cube":        { color: "#8D6E63", source: SOURCE.CRATE, note: "Found in crates / towers" },
  "Compressor":       { color: "#90A4AE", source: SOURCE.CRATE, note: "Tool found in crates" },
  "Cryoide Crystal":  { color: "#B2EBF2", source: SOURCE.BOSS,  note: "Dropped by Cryoide boss / ice islands" },
  "Spike":            { color: "#90A4AE", source: SOURCE.CRATE, note: "Found in crates" },
  "Juice":            { color: "#AED581", source: SOURCE.CRATE, note: "Found in crates / dropped by enemies" },
  "Spear Head":       { color: "#CFD8DC", source: SOURCE.CRATE, note: "Found in crates — used for spears" },
  "Great Hammer Head":{ color: "#B0BEC5", source: SOURCE.CRATE, note: "Found in crates — used for hammers" },
  "Infused Ash":      { color: "#616161", source: SOURCE.CRATE, note: "Source unknown" },
  "Obsidian Chunk":   { color: "#212121", source: SOURCE.CRATE, note: "Source unknown" },
  "Molten Sphere":    { color: "#FF6F00", source: SOURCE.CRATE, note: "Source unknown" },
};

// ─── BUILT-IN RECIPE GRAPH ───────────────────────────────────────────────────

const BUILT_IN_RECIPES = {
  "Iron Cube":           { inputs: ["Iron", "White Cube"],                  category: "Material Cube", beginner: true  },
  "Gold Cube":           { inputs: ["Gold", "White Cube"],                  category: "Material Cube", beginner: true  },
  "Copper Cube":         { inputs: ["Copper", "White Cube"],                category: "Material Cube", beginner: true  },
  "Forge Cube":          { inputs: ["Iron Cube", "Red Cube"],               category: "Material Cube", beginner: true  },
  "Plate Cube":          { inputs: ["Forge Cube", "Iron Cube"],             category: "Material Cube", beginner: true  },
  "Spiked Cube":         { inputs: ["Spike", "Plate Cube"],                 category: "Material Cube", beginner: true  },
  "Armor Cube":          { inputs: ["Gold Cube", "Blue Cube"],              category: "Material Cube", beginner: true  },
  "Helmet Cube":         { inputs: ["Armor Cube", "Blue Cube"],             category: "Material Cube", beginner: true  },
  "Chestplate Cube":     { inputs: ["Armor Cube", "Magenta Cube"],          category: "Material Cube", beginner: true  },
  "Leggings Cube":       { inputs: ["Armor Cube", "Red Cube"],              category: "Material Cube", beginner: true  },
  "Boots Cube":          { inputs: ["Armor Cube", "Yellow Cube"],           category: "Material Cube", beginner: true  },
  "Wealth Cube":         { inputs: ["Gold Cube", "Forge Cube"],             category: "Material Cube", beginner: true  },
  "Goldplate Cube":      { inputs: ["Plate Cube", "Wealth Cube"],           category: "Material Cube", beginner: true  },
  "Enrichment Cube":     { inputs: ["Goldplate Cube", "Wealth Cube"],       category: "Material Cube", beginner: true  },
  "Enriched Red Cube":   { inputs: ["Wealth Cube", "Red Cube"],             category: "Material Cube", beginner: true  },
  "Enriched Blue Cube":  { inputs: ["Wealth Cube", "Blue Cube"],            category: "Material Cube", beginner: true  },
  "Enriched Green Cube": { inputs: ["Wealth Cube", "Green Cube"],           category: "Material Cube", beginner: false },
  "Enriched Black Cube": { inputs: ["Wealth Cube", "Black Cube"],           category: "Material Cube", beginner: false },
  "Enriched Cyan Cube":  { inputs: ["Wealth Cube", "Cyan Cube"],            category: "Material Cube", beginner: false },
  "Enriched White Cube": { inputs: ["Wealth Cube", "White Cube"],           category: "Material Cube", beginner: false },
  "Enriched Yellow Cube":{ inputs: ["Wealth Cube", "Yellow Cube"],          category: "Material Cube", beginner: false },
  "Enriched Magenta Cube":{ inputs: ["Wealth Cube", "Magenta Cube"],        category: "Material Cube", beginner: false },
  "Cryoide Dust":        { inputs: ["Cryoide Crystal", "Compressor"],       category: "Material Cube", beginner: true  },
  "Cryoide Cube":        { inputs: ["Cryoide Dust", "White Cube"],          category: "Material Cube", beginner: true  },
  "Healer Cube":         { inputs: ["Green Cube", "Plate Cube"],            category: "Material Cube", beginner: true  },
  "Regen Cube":          { inputs: ["Healer Cube", "Wealth Cube"],          category: "Material Cube", beginner: true  },
  "Water Cube":          { inputs: ["Ice Cube", "Burner"],                  category: "Material Cube", beginner: true  },
  "Mud Cube":            { inputs: ["Water Cube", "Dirt Cube"],             category: "Material Cube", beginner: true  },
  "Soil Cube":           { inputs: ["Mud Cube", "Green Cube"],              category: "Material Cube", beginner: true  },
  "Nutrient Cube":       { inputs: ["Juice", "Dirt Cube"],                  category: "Material Cube", beginner: true  },
  "Coil":                { inputs: ["Forge Cube", "Copper Cube"],           category: "Material Cube", beginner: true  },
  "Steel Cube":          { unknown: true, category: "Material Cube", beginner: false },
  "Titanium Cube":       { unknown: true, category: "Material Cube", beginner: false },
  "Obsidian Cube":       { unknown: true, category: "Material Cube", beginner: false },
  "Concrete Cube":       { unknown: true, category: "Material Cube", beginner: false },
  "Glass Cube":          { unknown: true, category: "Material Cube", beginner: false },
  "Sand Cube":           { unknown: true, category: "Material Cube", beginner: false },
  "Life Cube":           { unknown: true, category: "Material Cube", beginner: false },
  "Ash Cube":            { unknown: true, category: "Material Cube", beginner: false },
  "Blade Cube":          { unknown: true, category: "Material Cube", beginner: false },
  "Enriched Glacier Cube":{ unknown: true, category: "Material Cube", beginner: false },
  "Enriched Cryoide Cube":{ unknown: true, category: "Material Cube", beginner: false },
  "Plated Armor Cube":   { unknown: true, category: "Material Cube", beginner: false },
  "Reinforced Plate Cube":{ unknown: true, category: "Material Cube", beginner: false },
  "Multi Cube":          { unknown: true, category: "Material Cube", beginner: false },
  "Alternate Cube":      { unknown: true, category: "Material Cube", beginner: false },
  "Club":                { inputs: ["Wood Cube", "Red Cube"],               category: "Club", beginner: true  },
  "Spiked Club":         { inputs: ["Club", "Spike"],                       category: "Club", beginner: true  },
  "Reinforced Club":     { inputs: ["Club", "Forge Cube"],                  category: "Club", beginner: true  },
  "Iron Club":           { inputs: ["Reinforced Club", "Iron Cube"],        category: "Club", beginner: true  },
  "Golden Club":         { inputs: ["Reinforced Club", "Gold Cube"],        category: "Club", beginner: true  },
  "Flaming Club":        { inputs: ["Iron Club", "Lava Cube"],              category: "Club", beginner: true  },
  "Goldfire Club":       { inputs: ["Flaming Club", "Golden Club"],         category: "Club", beginner: true  },
  "Frozen Club":         { inputs: ["Iron Club", "Ice Cube"],               category: "Club", beginner: true  },
  "Glacier Club":        { inputs: ["Frozen Club", "Glacier Cube"],         category: "Club", beginner: true  },
  "Permafrost Club":     { inputs: ["Glacier Club", "Cryoide Cube"],        category: "Club", beginner: true  },
  "Final Club":          { inputs: ["Goldfire Club", "Cryoide Cube"],       category: "Club", beginner: true  },
  "Ancient Club":        { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Club", beginner: false },
  "Iron Sword":          { inputs: ["Forge Cube", "Iron"],                  category: "Sword", beginner: true  },
  "Golden Sword":        { inputs: ["Iron Sword", "Gold Cube"],             category: "Sword", beginner: true  },
  "Flame Sword":         { inputs: ["Golden Sword", "Lava Cube"],           category: "Sword", beginner: true  },
  "Ice Sword":           { inputs: ["Golden Sword", "Ice Cube"],            category: "Sword", beginner: true  },
  "Goldfire Sword":      { inputs: ["Golden Sword", "Flame Sword"],         category: "Sword", beginner: true  },
  "Frost Sword":         { inputs: ["Ice Sword", "Glacier Cube"],           category: "Sword", beginner: true  },
  "Frostfire Sword":     { inputs: ["Flame Sword", "Frost Sword"],          category: "Sword", beginner: true  },
  "Copper Sword":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Sword", beginner: false },
  "Gold Sword":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Sword", beginner: false },
  "Cryoide Sword":       { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Sword", beginner: false },
  "Pyrolite Sword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Sword", beginner: false },
  "Obsidian Sword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Sword", beginner: false },
  "Steel Sword":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Sword", beginner: false },
  "Titanium Sword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Sword", beginner: false },
  "Ancient Sword":       { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Sword", beginner: false },
  "Meteorite Sword":     { unknown: true, obtain: "❓ Source unknown",                      category: "Sword", beginner: false },
  "Iron Longsword":      { unknown: true, obtain: "📦 Starter Pack Cube exclusive",         category: "Sword", beginner: false },
  "Venomshank":          { unknown: true, obtain: "📦 Drop: Satchel (1/240), Container (1/200), Wooden Crate (1/160)", category: "Sword", beginner: false },
  "Forsaken Blade":      { unknown: true, obtain: "💀 Boss drop — event item",              category: "Sword", beginner: false },
  "Copper Dagger":       { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Iron Dagger":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Gold Dagger":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Flame Dagger":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Ice Dagger":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Frost Dagger":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Frostfire Dagger":    { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Goldfire Dagger":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Cryoide Dagger":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Dagger", beginner: false },
  "Pyrolite Dagger":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Obsidian Dagger":     { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Dagger", beginner: false },
  "Steel Dagger":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Titanium Dagger":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Dagger", beginner: false },
  "Ancient Dagger":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Dagger", beginner: false },
  "Meteorite Dagger":    { unknown: true, obtain: "❓ Source unknown",                      category: "Dagger", beginner: false },
  "Iron Greatsword":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Greatsword", beginner: false },
  "Hardened Iron Greatsword": { unknown: true, obtain: "💀 Drop: Kill Raider Brute",                       category: "Greatsword", beginner: false },
  "Copper Greatsword":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Greatsword", beginner: false },
  "Gold Greatsword":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Greatsword", beginner: false },
  "Lava Greatsword":          { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Fiery Greatsword":         { unknown: true, obtain: "💀 Boss drop",                                     category: "Greatsword", beginner: false },
  "Ice Greatsword":           { unknown: true, obtain: "💀 Boss drop",                                     category: "Greatsword", beginner: false },
  "Glacier Greatsword":       { unknown: true, obtain: "💀 Boss drop",                                     category: "Greatsword", beginner: false },
  "Frostfire Greatsword":     { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Goldfire Greatsword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Cryoide Greatsword":       { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Pyrolite Greatsword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Greatsword", beginner: false },
  "Obsidian Greatsword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Permafrost Greatsword":    { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Steel Greatsword":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Greatsword", beginner: false },
  "Titanium Greatsword":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Greatsword", beginner: false },
  "Ancient Greatsword":       { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Greatsword", beginner: false },
  "Meteorite Greatsword":     { unknown: true, obtain: "❓ Source unknown",                                 category: "Greatsword", beginner: false },
  "Iron Spear":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Copper Spear":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Gold Spear":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Flame Spear":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Ice Spear":           { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Frost Spear":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Frostfire Spear":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Goldfire Spear":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Cryoide Spear":       { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Pyrolite Spear":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Obsidian Spear":      { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Spear", beginner: false },
  "Steel Spear":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Titanium Spear":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Spear", beginner: false },
  "Ancient Spear":       { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Spear", beginner: false },
  "Meteorite Spear":     { unknown: true, obtain: "❓ Source unknown",                                 category: "Spear", beginner: false },
  "Trident":             { unknown: true, obtain: "💀 Boss drop",                                     category: "Spear", beginner: false },
  "Abyssal Greatspear":  { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Spear", beginner: false },
  "Sledgehammer":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Hammer", beginner: false },
  "Warhammer":            { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Hammer", beginner: false },
  "Great Hammer":         { unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Hammer", beginner: false },
  "Plated Sledgehammer":  { unknown: true, obtain: "⚗️ Combining — recipe unknown",                    category: "Hammer", beginner: false },
  "Titanium Great Hammer":{ unknown: true, obtain: "⚗️ Combining — recipe unknown (requires boss drop)", category: "Hammer", beginner: false },
  "Utility Hammer":       { unknown: true, obtain: "❓ Source unknown",                                 category: "Hammer", beginner: false },
  "Throwable Cube":      { inputs: ["Iron", "Red Cube"],                    category: "Ranged", beginner: true  },
  "Explosive Cube":      { inputs: ["Throwable Cube", "Gunpowder Cube"],    category: "Ranged", beginner: true  },
  "Bomb Cube":           { inputs: ["Explosive Cube", "Lava Cube"],         category: "Ranged", beginner: true  },
  "Impact Cube":         { inputs: ["Explosive Cube", "Enrichment Cube"],   category: "Ranged", beginner: true  },
  "Impact Bomb Cube":    { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Ranged", beginner: false },
  "Caltrop":             { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Caltrop", beginner: false },
  "Flaming Caltrop":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Caltrop", beginner: false },
  "Rusty Caltrop":       { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Caltrop", beginner: false },
  "Titanium Caltrop":    { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Caltrop", beginner: false },
  "Icy Caltrop":         { unknown: true, obtain: "🎁 Event: Gift of Icy Sharps",           category: "Caltrop", beginner: false },
  "Iron Helmet":              { inputs: ["Helmet Cube", "Iron Cube"],        category: "Armor", beginner: true  },
  "Iron Chestplate":          { inputs: ["Chestplate Cube", "Iron Cube"],    category: "Armor", beginner: true  },
  "Iron Leggings":            { inputs: ["Leggings Cube", "Iron Cube"],      category: "Armor", beginner: true  },
  "Iron Boots":               { inputs: ["Boots Cube", "Iron Cube"],         category: "Armor", beginner: true  },
  "Spiked Iron Helmet":       { inputs: ["Iron Helmet", "Spiked Cube"],      category: "Armor", beginner: true  },
  "Spiked Iron Chestplate":   { inputs: ["Iron Chestplate", "Spiked Cube"],  category: "Armor", beginner: true  },
  "Spiked Iron Leggings":     { inputs: ["Iron Leggings", "Spiked Cube"],    category: "Armor", beginner: true  },
  "Spiked Iron Boots":        { inputs: ["Iron Boots", "Spiked Cube"],       category: "Armor", beginner: true  },
  "Pyrolite Helmet":          { inputs: ["Helmet Cube", "Pyrolite Cube"],    category: "Armor", beginner: true  },
  "Pyrolite Chestplate":      { inputs: ["Chestplate Cube", "Pyrolite Cube"],category: "Armor", beginner: true  },
  "Pyrolite Leggings":        { inputs: ["Leggings Cube", "Pyrolite Cube"],  category: "Armor", beginner: true  },
  "Pyrolite Boots":           { inputs: ["Boots Cube", "Pyrolite Cube"],     category: "Armor", beginner: true  },
  "Wooden Shield":            { inputs: ["Armor Cube", "Wood Cube"],         category: "Armor", beginner: true  },
  "Iron Shield":              { inputs: ["Armor Cube", "Iron Cube"],         category: "Armor", beginner: true  },
  "Spiked Iron Shield":       { inputs: ["Iron Shield", "Spiked Cube"],      category: "Armor", beginner: true  },
  "Copper Armor":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Gold Armor":          { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Cryoide Armor":       { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Plated Iron Armor":   { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Steel Armor":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Titanium Armor":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Copper Shield":       { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Gold Shield":         { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Cryoide Shield":      { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Pyrolite Shield":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Steel Shield":        { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Titanium Shield":     { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Plated Iron Shield":  { unknown: true, obtain: "⚗️ Combining — recipe unknown",          category: "Armor", beginner: false },
  "Regen Coil":          { inputs: ["Regen Cube", "Forge Cube"],            category: "Healing", beginner: true  },
  "Container Cube":      { inputs: ["Plate Cube", "Pack Cube"],             category: "Utility", beginner: true  },
  "Backpack Cube":       { inputs: ["Container Cube", "Wealth Cube"],       category: "Utility", beginner: true  },
  "Speed Coil":          { inputs: ["Coil", "Enriched Red Cube"],           category: "Utility", beginner: true  },
  "Gravity Coil":        { inputs: ["Coil", "Enriched Blue Cube"],          category: "Utility", beginner: true  },
  "Fusion Coil":         { inputs: ["Speed Coil", "Gravity Coil"],          category: "Utility", beginner: true  },
  "Platform":            { inputs: ["Plate Cube", "Wood Cube"],             category: "Utility", beginner: true  },
  "Defense Coil":             { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
  "Strength Coil":            { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
  "Creation Coil":            { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
  "Death Coil":               { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
  "Synthesis Coil":           { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
  "Reinforced Backpack Cube": { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
  "Vault Cube":               { unknown: true, obtain: "⚗️ Combining — recipe unknown", category: "Utility", beginner: false },
};

// ─── CATEGORY META ───────────────────────────────────────────────────────────

const CATEGORY_META = {
  "Club":          { icon: "🪓", color: "#8D6E63" },
  "Sword":         { icon: "⚔️",  color: "#90A4AE" },
  "Dagger":        { icon: "🗡️",  color: "#B0BEC5" },
  "Greatsword":    { icon: "🔱", color: "#7986CB" },
  "Spear":         { icon: "🏹", color: "#A1887F" },
  "Hammer":        { icon: "🔨", color: "#FF8A65" },
  "Ranged":        { icon: "💣", color: "#EF9A9A" },
  "Caltrop":       { icon: "📌", color: "#CE93D8" },
  "Armor":         { icon: "🛡️",  color: "#80CBC4" },
  "Healing":       { icon: "💚", color: "#A5D6A7" },
  "Utility":       { icon: "⚡", color: "#CE93D8" },
  "Material Cube": { icon: "🧱", color: "#FFCC80" },
};

const ALL_CATEGORIES      = ["Club","Sword","Dagger","Greatsword","Spear","Hammer","Ranged","Caltrop","Armor","Healing","Utility","Material Cube"];
const BEGINNER_CATEGORIES = ["Club","Sword","Ranged","Armor","Healing","Utility","Material Cube"];

// ─── API HELPERS ─────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── PURE HELPERS ────────────────────────────────────────────────────────────

function isBaseIngredient(name, allRecipes) {
  return BASE_CUBES[name] !== undefined && !allRecipes[name];
}
function getSourceInfo(name) {
  if (BASE_CUBES[name]) return BASE_CUBES[name].source || SOURCE.CRAFT;
  return SOURCE.CRAFT;
}
function getNote(name) { return BASE_CUBES[name]?.note || ""; }

function buildCraftingChain(name, allRecipes, visited = new Set()) {
  if (visited.has(name)) return [];
  visited.add(name);
  const recipe = allRecipes[name];
  if (!recipe || recipe.unknown) return [];
  const steps = [];
  for (const input of recipe.inputs) steps.push(...buildCraftingChain(input, allRecipes, visited));
  steps.push({ output: name, inputs: recipe.inputs, category: recipe.category });
  return steps;
}

function collectRawMaterials(name, allRecipes, memo = {}) {
  const recipe = allRecipes[name];
  if (!recipe || recipe.unknown) { memo[name] = (memo[name] || 0) + 1; return memo; }
  for (const input of recipe.inputs) collectRawMaterials(input, allRecipes, memo);
  return memo;
}

// ─── EDIT MODAL ──────────────────────────────────────────────────────────────

function EditModal({ itemName, existingRecipe, allRecipes, onSave, onClose, saving }) {
  const isNew   = !existingRecipe || !itemName;
  const builtIn = BUILT_IN_RECIPES[itemName];

  const [name,     setName]     = useState(itemName || "");
  const [input1,   setInput1]   = useState(existingRecipe?.inputs?.[0] || "");
  const [input2,   setInput2]   = useState(existingRecipe?.inputs?.[1] || "");
  const [category, setCategory] = useState(existingRecipe?.category || builtIn?.category || "Material Cube");
  const [obtain,   setObtain]   = useState(existingRecipe?.obtain || builtIn?.obtain || "");
  const [error,    setError]    = useState("");

  const allIngredients = useMemo(() => {
    return [...new Set([...Object.keys(BASE_CUBES), ...Object.keys(allRecipes)])].sort();
  }, [allRecipes]);

  const handleSave = () => {
    if (!name.trim())   { setError("Item name is required.");      return; }
    if (!input1.trim()) { setError("Ingredient 1 is required.");   return; }
    if (!input2.trim()) { setError("Ingredient 2 is required.");   return; }
    if (input1.trim().toLowerCase() === input2.trim().toLowerCase()) {
      setError("Ingredients must be different."); return;
    }
    setError("");
    onSave(name.trim(), input1.trim(), input2.trim(), category, obtain.trim());
  };

  const inputStyle = { width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#ddd", fontSize: "0.85rem", outline: "none" };
  const labelStyle = { fontSize: "0.68rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "5px" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ background: "#13161E", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", padding: "24px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, color: "#fff", fontSize: "1rem" }}>{isNew ? "Add New Recipe" : `Edit: ${itemName}`}</div>
            <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "2px" }}>{isNew ? "Add a brand new item and its recipe" : "Update the recipe for this item"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: "1.2rem", padding: "4px 8px" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {isNew && (
            <div>
              <label style={labelStyle}>Item Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Copper Greatsword" style={inputStyle} list="all-items-list" />
              <datalist id="all-items-list">{allIngredients.map(n => <option key={n} value={n} />)}</datalist>
            </div>
          )}
          <div>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {Object.keys(CATEGORY_META).map(c => <option key={c} value={c}>{CATEGORY_META[c].icon} {c}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", alignItems: "center", gap: "8px" }}>
            <div>
              <label style={labelStyle}>Ingredient 1</label>
              <input value={input1} onChange={e => setInput1(e.target.value)} placeholder="e.g. Iron Cube" style={inputStyle} list="ing1-list" />
              <datalist id="ing1-list">{allIngredients.map(n => <option key={n} value={n} />)}</datalist>
            </div>
            <div style={{ textAlign: "center", color: "#555", fontSize: "1.1rem", marginTop: "18px" }}>+</div>
            <div>
              <label style={labelStyle}>Ingredient 2</label>
              <input value={input2} onChange={e => setInput2(e.target.value)} placeholder="e.g. Gold Cube" style={inputStyle} list="ing2-list" />
              <datalist id="ing2-list">{allIngredients.map(n => <option key={n} value={n} />)}</datalist>
            </div>
          </div>
          <div>
            <label style={labelStyle}>How to obtain (optional note)</label>
            <input value={obtain} onChange={e => setObtain(e.target.value)} placeholder="e.g. ⚗️ Combining" style={inputStyle} />
          </div>
          {error && <div style={{ fontSize: "0.8rem", color: "#EF5350", background: "rgba(239,83,80,0.08)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,83,80,0.2)" }}>{error}</div>}
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button onClick={onClose} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#666", fontSize: "0.85rem" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "9px", borderRadius: "8px", background: saving ? "rgba(255,213,79,0.06)" : "rgba(255,213,79,0.15)", border: "1px solid rgba(255,213,79,0.3)", color: saving ? "#888" : "#FFD54F", fontWeight: 700, fontSize: "0.85rem" }}>
              {saving ? "Saving…" : "Save Recipe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOGGLE ──────────────────────────────────────────────────────────────────

function Toggle({ label, sublabel, checked, onChange, accentColor = "#FFD54F" }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", cursor: "pointer", borderRadius: "8px", background: checked ? `${accentColor}11` : "transparent", border: `1px solid ${checked ? accentColor + "33" : "rgba(255,255,255,0.07)"}`, transition: "all 0.2s", userSelect: "none" }}>
      <div style={{ width: "32px", height: "18px", borderRadius: "9px", flexShrink: 0, background: checked ? accentColor : "#333", position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: "3px", left: checked ? "17px" : "3px", width: "12px", height: "12px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: checked ? accentColor : "#888" }}>{label}</div>
        {sublabel && <div style={{ fontSize: "0.65rem", color: "#555", marginTop: "1px" }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── CUBE BADGE ──────────────────────────────────────────────────────────────

function CubeBadge({ name, onClick, allRecipes }) {
  const isBase = isBaseIngredient(name, allRecipes);
  const baseColor = BASE_CUBES[name]?.color;
  return (
    <span onClick={onClick} title={getSourceInfo(name) + (getNote(name) ? "\n" + getNote(name) : "")} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)", background: isBase ? `${baseColor || "#555"}33` : "rgba(255,255,255,0.06)", color: isBase ? (baseColor || "#ccc") : "#ddd", transition: "all 0.15s", userSelect: "none" }}>
      {isBase ? "◆" : "◇"} {name}
    </span>
  );
}

// ─── STEP CARD ───────────────────────────────────────────────────────────────

function StepCard({ step, index, total, onClickIngredient, allRecipes }) {
  const isLast = index === total - 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", marginBottom: "6px", background: isLast ? "rgba(255,213,79,0.08)" : "rgba(255,255,255,0.04)", borderRadius: "10px", border: isLast ? "1px solid rgba(255,213,79,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: isLast ? "#FFD54F22" : "#ffffff11", border: isLast ? "1px solid #FFD54F55" : "1px solid #ffffff22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", color: isLast ? "#FFD54F" : "#888", fontWeight: 700 }}>{index + 1}</div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", flex: 1 }}>
        {step.inputs.map((inp, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CubeBadge name={inp} allRecipes={allRecipes} onClick={() => onClickIngredient(inp)} />
            {i < step.inputs.length - 1 && <span style={{ color: "#666" }}>+</span>}
          </span>
        ))}
        <span style={{ color: "#555", margin: "0 4px" }}>→</span>
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: isLast ? "rgba(255,213,79,0.15)" : "rgba(255,255,255,0.08)", color: isLast ? "#FFD54F" : "#fff", border: isLast ? "1px solid #FFD54F55" : "1px solid rgba(255,255,255,0.15)" }}>
          {isLast ? "✦ " : ""}{step.output}
        </span>
      </div>
    </div>
  );
}

// ─── MATERIALS LIST ──────────────────────────────────────────────────────────

function MaterialsList({ name, allRecipes }) {
  const mats   = collectRawMaterials(name, allRecipes);
  const sorted = Object.entries(mats).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#888", marginBottom: "8px", textTransform: "uppercase" }}>Raw Materials Needed</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {sorted.map(([mat, count]) => (
          <span key={mat} title={getSourceInfo(mat) + (getNote(mat) ? "\n" + getNote(mat) : "")} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "#ccc", border: "1px solid rgba(255,255,255,0.12)", cursor: "help" }}>
            {count > 1 ? `×${count} ` : ""}{mat}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ────────────────────────────────────────────────────────────

function DetailPanel({ selected, allRecipes, onClickIngredient, onEdit, onDelete }) {
  const steps    = useMemo(() => buildCraftingChain(selected, allRecipes), [selected, allRecipes]);
  const recipe   = allRecipes[selected];
  const catMeta  = recipe ? (CATEGORY_META[recipe.category] || {}) : {};
  const isUnknown  = recipe?.unknown && !recipe?.inputs;
  const isBase     = !recipe;
  const isUserAdded = recipe?.userAdded;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.6rem" }}>{catMeta.icon || (isBase ? "◆" : "◇")}</span>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}>{selected}</div>
            {recipe && (
              <div style={{ fontSize: "0.72rem", color: catMeta.color || "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {recipe.category}
                {isUnknown   && <span style={{ color: "#F57F17", background: "#F57F1722", padding: "1px 7px", borderRadius: "10px", border: "1px solid #F57F1744" }}>❓ Recipe Unknown</span>}
                {isUserAdded && <span style={{ color: "#AB47BC", background: "#AB47BC22", padding: "1px 7px", borderRadius: "10px", border: "1px solid #AB47BC44" }}>✏️ Your Recipe</span>}
                {!isUnknown && !isBase && recipe.beginner && <span style={{ color: "#66BB6A", background: "#66BB6A22", padding: "1px 7px", borderRadius: "10px", border: "1px solid #66BB6A44" }}>⭐ Beginner</span>}
              </div>
            )}
          </div>
        </div>
        {!isBase && (
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button onClick={() => onEdit(selected, recipe)} style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(255,213,79,0.1)", border: "1px solid rgba(255,213,79,0.25)", color: "#FFD54F", fontSize: "0.78rem", fontWeight: 600 }}>
              ✏️ {isUnknown && !isUserAdded ? "Add Recipe" : "Edit"}
            </button>
            {isUserAdded && (
              <button onClick={() => onDelete(selected)} style={{ padding: "6px 10px", borderRadius: "8px", background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.2)", color: "#EF5350", fontSize: "0.78rem" }}>
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {isBase ? (
        <div style={{ marginTop: "16px", padding: "16px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>How to get it</div>
          <div style={{ fontSize: "0.9rem", color: "#ddd" }}>{getSourceInfo(selected)}</div>
          {getNote(selected) && <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "6px" }}>{getNote(selected)}</div>}
        </div>
      ) : isUnknown ? (
        <div style={{ marginTop: "16px", padding: "20px", background: "rgba(245,127,23,0.06)", borderRadius: "12px", border: "1px solid rgba(245,127,23,0.2)" }}>
          <div style={{ fontSize: "1.1rem", marginBottom: "8px" }}>🔍</div>
          <div style={{ fontSize: "0.9rem", color: "#F57F17", fontWeight: 600, marginBottom: "10px" }}>Recipe not yet discovered</div>
          {recipe.obtain ? (
            <div style={{ fontSize: "0.85rem", color: "#ccc", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: "0.68rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>How to obtain</span>
              {recipe.obtain}
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "#555" }}>Source unknown — discover it in-game and tap "Add Recipe" above!</div>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginTop: "6px", marginBottom: "16px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", fontSize: "0.8rem", color: "#888" }}>
            {steps.length} crafting {steps.length === 1 ? "step" : "steps"} from raw materials • {Object.keys(collectRawMaterials(selected, allRecipes)).length} unique raw materials
          </div>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#888", marginBottom: "10px", textTransform: "uppercase" }}>Crafting Chain</div>
          {steps.map((step, i) => (
            <StepCard key={step.output + i} step={step} index={i} total={steps.length} onClickIngredient={onClickIngredient} allRecipes={allRecipes} />
          ))}
          <MaterialsList name={selected} allRecipes={allRecipes} />
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", fontSize: "0.73rem", color: "#666" }}>
            💡 Tap any ingredient badge to jump to its recipe. Hover badges for source info.
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [selected, setSelected]               = useState("Iron Chestplate");
  const [activeCategory, setActiveCategory]   = useState("All");
  const [search, setSearch]                   = useState("");
  const [beginnerMode, setBeginnerMode]       = useState(true);
  const [hideUnknown, setHideUnknown]         = useState(true);
  const [userRecipes, setUserRecipes]         = useState({});
  const [editModal, setEditModal]             = useState(null);
  const [loadState, setLoadState]             = useState("loading"); // "loading" | "ok" | "error"
  const [saving, setSaving]                   = useState(false);
  const [saveError, setSaveError]             = useState("");

  // ── Load user recipes from D1 on mount ──
  useEffect(() => {
    apiFetch("/api/recipes")
      .then(data => { setUserRecipes(data); setLoadState("ok"); })
      .catch(() => setLoadState("error"));
  }, []);

  // Merge built-in + user recipes; user recipes win on conflict
  const allRecipes = useMemo(() => ({ ...BUILT_IN_RECIPES, ...userRecipes }), [userRecipes]);

  const visibleCategories = beginnerMode ? BEGINNER_CATEGORIES : ALL_CATEGORIES;
  const categories = ["All", ...visibleCategories];

  const allItems = useMemo(() => {
    return Object.entries(allRecipes)
      .filter(([, r]) => visibleCategories.includes(r.category))
      .filter(([, r]) => !beginnerMode || r.beginner || r.userAdded)
      .filter(([, r]) => !hideUnknown || !r.unknown || r.inputs)
      .map(([name, r]) => ({ name, ...r }));
  }, [allRecipes, beginnerMode, hideUnknown, visibleCategories.join()]);

  const filtered = useMemo(() => allItems.filter(item => {
    const catMatch    = activeCategory === "All" || item.category === activeCategory;
    const searchMatch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  }), [allItems, search, activeCategory]);

  const groupedFiltered = useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item.name);
    }
    return groups;
  }, [filtered]);

  const unknownCount = Object.values(allRecipes).filter(r => visibleCategories.includes(r.category) && r.unknown && !r.inputs).length;
  const userCount    = Object.keys(userRecipes).length;

  // ── Save recipe to D1 ──
  const handleSaveRecipe = useCallback(async (name, input1, input2, category, obtain) => {
    setSaving(true);
    setSaveError("");
    try {
      await apiFetch("/api/recipes", {
        method: "POST",
        body: JSON.stringify({ name, input1, input2, category, obtain }),
      });
      // Optimistic update — shape into the same format GET returns
      setUserRecipes(prev => ({
        ...prev,
        [name]: { inputs: [input1, input2], category, obtain: obtain || undefined, beginner: false, userAdded: true },
      }));
      setEditModal(null);
      setSelected(name);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Delete user recipe from D1 ──
  const handleDeleteRecipe = useCallback(async (name) => {
    try {
      await apiFetch(`/api/recipes/${encodeURIComponent(name)}`, { method: "DELETE" });
      setUserRecipes(prev => { const n = { ...prev }; delete n[name]; return n; });
      if (!BUILT_IN_RECIPES[name]) setSelected("Iron Chestplate");
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }, []);

  const handleIngredientClick = (name) => {
    if (allRecipes[name] || BASE_CUBES[name]) {
      setSelected(name); setActiveCategory("All"); setSearch("");
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0D0F14", color: "#ccc", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        input, select { color-scheme: dark; }
      `}</style>

      {editModal && (
        <EditModal
          itemName={editModal.name}
          existingRecipe={editModal.recipe}
          allRecipes={allRecipes}
          onSave={handleSaveRecipe}
          onClose={() => { setEditModal(null); setSaveError(""); }}
          saving={saving}
        />
      )}
      {saveError && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 2000, background: "#1E1218", border: "1px solid rgba(239,83,80,0.4)", borderRadius: "10px", padding: "12px 16px", color: "#EF5350", fontSize: "0.85rem", maxWidth: "320px" }}>
          ⚠️ Save failed: {saveError}
          <button onClick={() => setSaveError("")} style={{ marginLeft: "10px", background: "none", border: "none", color: "#EF5350", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "12px 20px", background: "#080A0F", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.4rem" }}>🎮</span>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>CUBE COMBINATION</div>
              <div style={{ fontSize: "0.62rem", color: "#555", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Crafting Compendium
                {loadState === "loading" && <span style={{ marginLeft: "8px", color: "#F57F17" }}>● syncing…</span>}
                {loadState === "error"   && <span style={{ marginLeft: "8px", color: "#EF5350" }}>● offline</span>}
                {loadState === "ok"      && userCount > 0 && <span style={{ marginLeft: "8px", color: "#66BB6A" }}>● {userCount} custom recipe{userCount !== 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <Toggle label="Beginner Mode" sublabel="Iron & Pyrolite tier only" checked={beginnerMode} onChange={v => { setBeginnerMode(v); setActiveCategory("All"); }} accentColor="#66BB6A" />
            <Toggle label="Hide Unknown Recipes" sublabel={`${unknownCount} items hidden`} checked={hideUnknown} onChange={setHideUnknown} accentColor="#FFD54F" />
            <button onClick={() => setEditModal({ name: "", recipe: null })} style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(171,71,188,0.12)", border: "1px solid rgba(171,71,188,0.3)", color: "#CE93D8", fontSize: "0.75rem", fontWeight: 700 }}>
              + Add Recipe
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: "230px", flexShrink: 0, background: "#080A0F", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 10px 6px" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${allItems.length} items…`}
              style={{ width: "100%", padding: "7px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ddd", fontSize: "0.8rem", outline: "none" }} />
          </div>
          <div style={{ padding: "0 8px 8px", display: "flex", flexWrap: "wrap", gap: "3px" }}>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat] || {};
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "3px 8px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: activeCategory === cat ? (meta.color ? meta.color + "22" : "rgba(255,255,255,0.1)") : "transparent", color: activeCategory === cat ? (meta.color || "#fff") : "#555", fontSize: "0.68rem", fontWeight: activeCategory === cat ? 700 : 400 }}>
                  {meta.icon || ""} {cat}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
            {loadState === "loading" ? (
              <div style={{ padding: "20px 10px", textAlign: "center", color: "#444", fontSize: "0.8rem" }}>Loading recipes…</div>
            ) : (
              <>
                {Object.entries(groupedFiltered).map(([cat, names]) => (
                  <div key={cat}>
                    <div style={{ fontSize: "0.6rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em", padding: "8px 6px 4px" }}>{CATEGORY_META[cat]?.icon} {cat}</div>
                    {names.map(name => {
                      const r = allRecipes[name];
                      const isUnk  = r?.unknown && !r?.inputs;
                      const isUser = r?.userAdded;
                      return (
                        <div key={name} onClick={() => setSelected(name)} style={{ padding: "6px 10px", borderRadius: "7px", cursor: "pointer", fontSize: "0.8rem", fontWeight: selected === name ? 700 : 400, color: selected === name ? "#fff" : isUnk ? "#555" : "#888", background: selected === name ? "rgba(255,213,79,0.08)" : "transparent", border: selected === name ? "1px solid rgba(255,213,79,0.2)" : "1px solid transparent", marginBottom: "1px", transition: "all 0.1s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{name}</span>
                          <span style={{ display: "flex", gap: "3px" }}>
                            {isUser && <span style={{ fontSize: "0.55rem", color: "#AB47BC" }}>✏️</span>}
                            {isUnk  && <span style={{ fontSize: "0.6rem",  color: "#F57F17", opacity: 0.7 }}>❓</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {Object.keys(groupedFiltered).length === 0 && (
                  <div style={{ padding: "20px 10px", textAlign: "center", color: "#444", fontSize: "0.8rem" }}>No items match</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {selected ? (
            <DetailPanel selected={selected} allRecipes={allRecipes} onClickIngredient={handleIngredientClick} onEdit={(name, recipe) => { setSaveError(""); setEditModal({ name, recipe }); }} onDelete={handleDeleteRecipe} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#444", fontSize: "0.9rem" }}>Select an item to see its crafting chain</div>
          )}
        </div>
      </div>
    </div>
  );
}
