# Aging Discount Feature Design

## Overview
Calculate a fake original price and a discounted special price for each inventory item based on its aging (how many days it has been in stock) to display in the Planner app's stock table and pass to the AI Content Creator.

## Discount Logic
1. **Original Price (ราคาปกติ):**
   - Base = `sellPrice`
   - Calculation: Add 10% to `sellPrice`, then round the last digit to 0 (e.g. `Math.ceil((sellPrice * 1.1) / 10) * 10`).
   - If `sellPrice` is null or 0, this cannot be calculated.

2. **Special Price (ราคาพิเศษ):**
   - Base = `sellPrice`
   - Discount based on `agingDays`:
     - `> 120` days -> 20% discount
     - `> 90` days -> 10% discount
     - `> 60` days -> 5% discount
     - `<= 60` days -> 0% discount (Special Price = Sell Price)
   - The special price will also be rounded down or up appropriately (e.g. `Math.floor((sellPrice * (1 - discount/100)) / 10) * 10` or just exact).

## UI Design (StockTablePanel)
- The "ราคาขาย" (Sell Price) column will be updated to show both prices if there is a discount or aging logic applied.
- The "Original Price" will be displayed at the top in smaller, gray, strike-through text.
- The "Special Price" will be displayed below it in larger, colored text (e.g., green or red depending on margin/aging).

## Prompt Generation (PlannerApp)
- The `handleSelectProduct` function will be updated to include the new calculated prices when generating the prompt string, e.g. "ราคาปกติ 1,590 บาท ราคาลดพิเศษ 1,190 บาท".
