/**
 * Chai scaling model — ported verbatim from chai_scaling_calculator.html.
 * The constants and formulas below are intentionally unchanged; only the
 * DOM rendering was split out (see `render`). scripts/verify-calculator.mjs
 * checks this port against the original file.
 */

export const CAL = {
  finalVolume: 405, waterStart: 250, milkStart: 230,
  teaDry: 10, sugar: 10, evapLoss: 55, leafAbsorption: 20,
  surfaceArea: 170, boilTimeWater: 1.5, boilTimeMilk: 1.0,
  servingSize: 250, milkFatPct: 0.02, milkProteinPct: 0.034,
  heatRateWater: 3.0 / 250, // min per ml — from calibration
  heatRateMilk: 4.0 / 230, // min per ml — from calibration (cold milk added)
};

export const k = CAL.evapLoss / (CAL.surfaceArea * (CAL.boilTimeWater + CAL.boilTimeMilk));
export const milkToWater = CAL.milkStart / CAL.waterStart;
export const leafAbsPerG = CAL.leafAbsorption / CAL.teaDry;
export const waterBoilFrac = CAL.boilTimeWater / (CAL.boilTimeWater + CAL.boilTimeMilk);

export const MIN_BOIL = 2.0; // min — CTC extraction floor
export const MAX_MILK_BOIL = 1.0; // min — practical cap, 2-3 rises
export const MAX_TIME = 15.0; // min — total recipe cap

export const vesselArea = (d: number) => Math.PI * Math.pow(d / 2, 2);
const fmt = (n: number, d?: number) => n.toFixed(d !== undefined ? d : 0);

export interface ChaiResult {
  servings: number;
  finalVol: number;
  tea: number;
  sugar: number;
  water: number;
  milk: number;
  evapLoss: number;
  leafAbsorp: number;
  totalLoss: number;
  startLiquid: number;
  totalBoilTime: number;
  waterBoilTime: number;
  milkBoilTime: number;
  heatWaterTime: number;
  heatMilkTime: number;
  totalTime: number;
  timeOver: boolean;
  minBoilWarning: boolean;
  vesselCap: number;
  milkRiseVol: number;
  tooSmall: boolean;
  fits: boolean;
}

/** Returns null for the same inputs the original rejects (`if (!diam || !height || !servings) return;`). */
export function compute(diam: number, height: number, servings: number): ChaiResult | null {
  if (!diam || !height || !servings) return null;

  const finalVol = servings * CAL.servingSize;
  const tea = (CAL.teaDry / CAL.finalVolume) * finalVol;
  const sugar = (CAL.sugar / CAL.finalVolume) * finalVol;
  const area = vesselArea(diam);
  const leafAbsorp = leafAbsPerG * tea;
  const targetEvap = CAL.evapLoss * (finalVol / CAL.finalVolume);
  const idealBoilTime = targetEvap / (k * area);

  let totalBoilTime: number, evapLoss: number, minBoilWarning: boolean;
  if (idealBoilTime >= MIN_BOIL) {
    totalBoilTime = idealBoilTime;
    evapLoss = targetEvap;
    minBoilWarning = false;
  } else {
    totalBoilTime = MIN_BOIL;
    evapLoss = k * area * MIN_BOIL;
    minBoilWarning = true;
  }

  const waterBoilTime = totalBoilTime * waterBoilFrac;
  const milkBoilTime = Math.min(totalBoilTime * (1 - waterBoilFrac), MAX_MILK_BOIL);
  const totalLoss = evapLoss + leafAbsorp;
  const startLiquid = finalVol + totalLoss;
  const water = startLiquid / (1 + milkToWater);
  const milk = startLiquid - water;

  const heatWaterTime = water * CAL.heatRateWater;
  const heatMilkTime = milk * CAL.heatRateMilk;
  const totalTime = heatWaterTime + waterBoilTime + heatMilkTime + milkBoilTime;
  const timeOver = totalTime > MAX_TIME;

  const vesselCap = area * height * 0.85;
  const milkRiseVol = startLiquid * 1.15;
  const tooSmall = startLiquid > vesselCap;
  const fits = milkRiseVol <= vesselCap;

  return {
    servings, finalVol, tea, sugar, water, milk, evapLoss, leafAbsorp, totalLoss, startLiquid,
    totalBoilTime, waterBoilTime, milkBoilTime, heatWaterTime, heatMilkTime, totalTime,
    timeOver, minBoilWarning, vesselCap, milkRiseVol, tooSmall, fits,
  };
}

/** HTML for each results section. Wording and numbers match the original; class names are the site's. */
export function render(r: ChaiResult) {
  const {
    water, milk, tea, sugar, finalVol, servings, evapLoss, leafAbsorp, totalLoss, startLiquid,
    waterBoilTime, milkBoilTime, heatWaterTime, heatMilkTime, totalTime, timeOver, minBoilWarning,
    vesselCap, milkRiseVol, tooSmall, fits,
  } = r;

  const timeBar = `
      <div class="calc-timebar ${timeOver ? 'is-warn' : ''}">
        <div>
          <div class="calc-timebar__total">~${fmt(totalTime, 0)} min</div>
          <div class="calc-timebar__label">estimated total</div>
          ${timeOver ? `<div class="calc-timebar__warning">⚠ Exceeds 15 min target. Consider using a wider vessel to reduce boil time, or plan ahead for a longer cook. Concentrations will still be correct.</div>` : ''}
        </div>
        <div class="calc-timebar__breakdown">
          Heat water &nbsp; ~${fmt(heatWaterTime, 1)} min<br>
          Water boil &nbsp; ${fmt(waterBoilTime, 1)} min<br>
          Heat milk &nbsp;&nbsp; ~${fmt(heatMilkTime, 1)} min<br>
          Milk rise &nbsp;&nbsp; ${fmt(milkBoilTime, 1)} min
        </div>
      </div>
    `;

  const recipeGrid = `
      <div class="calc-item is-key">
        <div class="calc-item__name">Water</div>
        <div class="calc-item__amount">${Math.round(water)}<span class="calc-item__unit">ml</span></div>
      </div>
      <div class="calc-item is-key">
        <div class="calc-item__name">Milk (2%)</div>
        <div class="calc-item__amount">${Math.round(milk)}<span class="calc-item__unit">ml</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-item__name">Wagh Bakri Tea</div>
        <div class="calc-item__amount">${fmt(tea, 1)}<span class="calc-item__unit">g</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-item__name">Sugar</div>
        <div class="calc-item__amount">${fmt(sugar, 1)}<span class="calc-item__unit">g</span></div>
      </div>
    `;

  const warnBanner = minBoilWarning ? `
      <li class="calc-step is-warn">
        <div class="calc-step__num">!</div>
        <div class="calc-step__text">Your vessel is wide enough that a shorter boil would suffice for evaporation, but <strong>2 min minimum is required for full CTC extraction</strong>. Input volumes have been increased to account for extra evaporation.</div>
      </li>` : '';

  const instructions = warnBanner + `
      <li class="calc-step">
        <div class="calc-step__num">01</div>
        <div class="calc-step__text">Add <strong>${Math.round(water)} ml water</strong> and <strong>${fmt(tea, 1)} g Wagh Bakri tea</strong> to your pot. Heat on high (~${fmt(heatWaterTime, 1)} min to reach boil).</div>
      </li>
      <li class="calc-step is-mark">
        <div class="calc-step__num">02</div>
        <div class="calc-step__text">Once the surface breaks into a vigorous boil, boil for <strong>${fmt(waterBoilTime, 1)} minutes</strong>. Keep heat on high.</div>
      </li>
      <li class="calc-step">
        <div class="calc-step__num">03</div>
        <div class="calc-step__text">Add <strong>${Math.round(milk)} ml cold milk</strong>. Bring back to boil on high heat (~${fmt(heatMilkTime, 1)} min).</div>
      </li>
      <li class="calc-step is-mark">
        <div class="calc-step__num">04</div>
        <div class="calc-step__text">Once the milk reaches a rolling boil, allow <strong>${fmt(milkBoilTime, 1)} minute</strong> of rises (2–3 times), reducing heat each time to prevent boil-over.</div>
      </li>
      <li class="calc-step">
        <div class="calc-step__num">05</div>
        <div class="calc-step__text">Strain into cups. Stir in <strong>${fmt(sugar, 1)} g sugar</strong>. Yields ~<strong>${Math.round(finalVol)} ml</strong> (${fmt(servings, 2)} × 250ml servings).</div>
      </li>
    `;

  const losses = `
      <div class="calc-loss"><div class="calc-loss__val">${Math.round(evapLoss)}ml</div><div class="calc-loss__label">Evaporation</div></div>
      <div class="calc-loss"><div class="calc-loss__val">${Math.round(leafAbsorp)}ml</div><div class="calc-loss__label">Leaf Absorption</div></div>
      <div class="calc-loss"><div class="calc-loss__val">${Math.round(totalLoss)}ml</div><div class="calc-loss__label">Total Loss</div></div>
      <div class="calc-loss"><div class="calc-loss__val">${Math.round(finalVol)}ml</div><div class="calc-loss__label">Final in Cup</div></div>
    `;

  const fat = (CAL.milkStart * CAL.milkFatPct) / CAL.finalVolume;
  const protein = (CAL.milkStart * CAL.milkProteinPct) / CAL.finalVolume;
  const concentrations = `
      <div class="calc-conc"><span class="calc-conc__label">Tea solids (extracted)</span><span class="calc-conc__value">${((CAL.teaDry * 0.325 / CAL.finalVolume) * 1000).toFixed(1)} mg/ml</span></div>
      <div class="calc-conc"><span class="calc-conc__label">Sugar</span><span class="calc-conc__value">${((CAL.sugar / CAL.finalVolume) * 1000).toFixed(1)} mg/ml</span></div>
      <div class="calc-conc"><span class="calc-conc__label">Milk fat</span><span class="calc-conc__value">${(fat * 1000).toFixed(1)} mg/ml <span class="calc-conc__note">mouthfeel</span></span></div>
      <div class="calc-conc"><span class="calc-conc__label">Milk protein</span><span class="calc-conc__value">${(protein * 1000).toFixed(1)} mg/ml <span class="calc-conc__note">body</span></span></div>
    `;

  let dotClass: string, statusText: string, detailText: string;
  if (tooSmall) {
    dotClass = 'red'; statusText = 'Vessel too small for this batch';
    detailText = `Starting liquid (${Math.round(startLiquid)}ml) exceeds safe vessel capacity (${Math.round(vesselCap)}ml). Use a larger pot or reduce servings.`;
  } else if (!fits) {
    dotClass = 'yellow'; statusText = 'Watch the milk rise — vessel is snug';
    detailText = `Liquid fits at rest (${Math.round(startLiquid)}ml / ${Math.round(vesselCap)}ml) but milk rise (~${Math.round(milkRiseVol)}ml) may reach the rim. Stay close.`;
  } else {
    dotClass = 'green'; statusText = 'Vessel is adequate for this batch';
    detailText = `Starting liquid: ${Math.round(startLiquid)}ml. Safe capacity: ${Math.round(vesselCap)}ml. Headroom after milk rise: ${Math.round(vesselCap - milkRiseVol)}ml.`;
  }
  const sanity = `
      <div class="calc-status"><div class="calc-dot is-${dotClass}"></div><span>${statusText}</span></div>
      <div class="calc-sanity__detail">${detailText}</div>
    `;

  return { timeBar, recipeGrid, instructions, losses, concentrations, sanity };
}
