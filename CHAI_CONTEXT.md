# Chai Scaling Formula — Project Context

This document captures the full reasoning, calibration data, and formula logic developed in a Claude conversation. Use it as ground truth when building the chai webpage and scaling calculator.

---

## Background

The goal is a static webpage (GitHub Pages) that teaches people how to make chai, sells masala, and embeds a scaling calculator. The calculator is calibrated to one person's daily single-serving recipe and generalizes to any vessel size and number of servings.

The core insight: most chai recipes fail to scale because they treat it as a simple "multiply everything" problem. In reality, evaporation loss scales with vessel surface area (quadratically with radius), not with volume — so the same recipe in a different pot yields a different concentration of tea, fat, and protein in the final cup.

---

## Calibration Recipe (Ground Truth)

Everything is calibrated from this single empirically measured cup:

| Parameter | Value |
|---|---|
| Water (start) | 250 ml |
| Milk — 2% fat (start) | 230 ml |
| Total starting liquid | 480 ml |
| Wagh Bakri tea (dry) | 10 g |
| Wagh Bakri tea (wet, after straining) | 30 g |
| Sugar (added post-strain) | 10 g |
| Final yield in cup | 405 ml |
| Total liquid loss | 75 ml |

**Loss breakdown:**
- Leaf absorption: 30g wet − 10g dry = 20 ml retained in leaves (2× dry weight)
- True evaporative loss: 75 − 20 = **55 ml**

**Vessel:** Aluminum pot, slightly conical (13 cm bottom, 16.5 cm top). Effective diameter taken as midpoint = **14.75 cm**. Effective surface area = π × (14.75/2)² ≈ **170 cm²**.

**Stove:** Glasstop, full contact with vessel bottom, heat on high throughout.

---

## Process (Calibration)

| Stage | Duration | Notes |
|---|---|---|
| Heat water + tea to boil | ~3 min | Not counted as boil time |
| Water at rolling boil | ~1.5 min | Timed from "surface breaks significantly" |
| Add cold milk, heat to boil | ~4 min | Not counted as boil time |
| Milk at rolling boil / rise | ~1.0 min | Ends at milk rise; 2–3 rises |
| **Total cook time** | **~9.5 min** | |

Sugar is added after straining, not during cooking.

**Boil time definition:** starts when the liquid surface breaks significantly and begins rapid boiling. Includes both pre-rolling-boil steam loss and true rolling boil — empirically lumped into one constant.

---

## Key Physics

**Evaporation rate constant (k):**
```
k = evapLoss / (surfaceArea × totalBoilTime)
k = 55 / (170 × 2.5)
k ≈ 0.129 ml/min/cm²
```

This constant is empirical and bakes in everything specific to this setup (glasstop on high, aluminum vessel, this process). It should not be re-derived from first principles — it is the calibration anchor.

**Why surface area matters:**
Evaporation scales with surface area (π × r²), not volume. Doubling the vessel diameter quadruples evaporation rate. This is why "same recipe, different pot" fails.

**Why boil time is an output, not an input:**
For a fixed target final volume and fixed vessel, you can solve for the boil time needed to lose exactly the right amount of liquid:
```
boilTime = targetEvapLoss / (k × vesselArea)
```
Larger vessel → shorter required boil time (higher rate, same loss target).

---

## Formula Logic

### Inputs
- Vessel diameter (cm) — inner diameter
- Vessel height (cm) — for sanity check only
- Number of servings (× 250 ml each)

### Constants (derived from calibration)
```
k              = 0.129 ml/min/cm²       evaporation rate constant
milkToWater    = 230/250 = 0.92         milk:water ratio
leafAbsPerG    = 20/10 = 2.0            ml liquid absorbed per gram dry tea
waterBoilFrac  = 1.5/2.5 = 0.60        fraction of boil time in water stage
milkBoilFrac   = 1.0/2.5 = 0.40        fraction of boil time in milk stage
heatRateWater  = 3.0/250 = 0.012       min per ml to heat water to boil
heatRateMilk   = 4.0/230 = 0.0174      min per ml to heat cold milk to boil
```

### Target concentrations (invariant across scale)
These are what define "the same cup of chai" regardless of batch size:

| Compound | Concentration | Affects |
|---|---|---|
| Tea solids (extracted, ~32.5% yield) | 8.0 mg/ml | Flavor, strength |
| Sugar | 24.7 mg/ml | Sweetness |
| Milk fat | 11.4 mg/ml | Mouthfeel |
| Milk protein | 19.3 mg/ml | Body |

### Step-by-step calculation
```
1. finalVol     = servings × 250
2. tea          = 10g × (finalVol / 405)
3. sugar        = 10g × (finalVol / 405)
4. area         = π × (diameter/2)²
5. leafAbsorp   = tea × 2.0
6. targetEvap   = 55ml × (finalVol / 405)
7. idealBoilTime = targetEvap / (k × area)

8. If idealBoilTime ≥ 2.0 min (CTC extraction floor):
      totalBoilTime = idealBoilTime
      evapLoss      = targetEvap
   Else (vessel too wide — large vessel mode):
      totalBoilTime = 2.0 min  ← locked at extraction floor
      evapLoss      = k × area × 2.0  ← input volumes increase to compensate

9. waterBoilTime = totalBoilTime × 0.60  (capped implicitly)
   milkBoilTime  = min(totalBoilTime × 0.40, 1.0)  ← hard cap at 1 min

10. totalLoss    = evapLoss + leafAbsorp
11. startLiquid  = finalVol + totalLoss
12. water        = startLiquid / (1 + 0.92)
13. milk         = startLiquid − water

14. heatWaterTime = water × 0.012
    heatMilkTime  = milk  × 0.0174
    totalTime     = heatWaterTime + waterBoilTime + heatMilkTime + milkBoilTime
```

### Constraints and warnings
| Condition | Response |
|---|---|
| idealBoilTime < 2.0 min | Large vessel mode: lock boil time, increase volumes, show warning |
| milkBoilTime > 1.0 min | Hard cap at 1.0 min (practical limit: 2–3 rises) |
| totalTime > 15 min | Show time warning; recipe still valid, concentrations correct |
| startLiquid > vesselCap (area × height × 0.85) | Red vessel warning |
| milkRiseVol (startLiquid × 1.15) > vesselCap | Yellow vessel warning |

---

## Tea Notes

**Wagh Bakri** is a CTC (cut-tear-curl) blend — machine-processed into small granules for fast, aggressive extraction. Key properties:
- Extracts most soluble compounds within 2–3 minutes at boiling
- Minimum 2 min at rolling boil for full extraction (peer-reviewed lower bound)
- Milk's casein proteins bind tannins — reduces bitterness risk significantly
- Bitterness risk from CTC is real but largely neutralized by milk in chai

**Extraction yield:** ~32.5% of dry leaf weight becomes dissolved solids in the cup. This is a standard estimate for CTC tea; Wagh Bakri likely sits at the high end due to fine grind.

---

## Webpage / Product Context

- The calculator is the centerpiece feature
- The product being sold is **masala** (chai spice blend) — spices are not yet in the formula (v2 feature)
- Tone: educational, precise but approachable — the science explains *why* your chai tastes different every time
- The milk rise as a doneness signal is a key teaching moment — it's a self-regulating natural endpoint that experienced chai makers use
- Color as a proxy for concentration is something experienced makers use — worth mentioning as a visual cue alongside the timed instructions

---

## Files

- `chai_scaling_calculator.html` — the working calculator artifact (download from Claude.ai conversation)
- This file (`CHAI_CONTEXT.md`) — full project context for Claude Code

---

## What's Not Yet in the Formula (v2)

- Spices (cardamom, ginger, etc.) — scale linearly with tea quantity, straightforward to add
- Gas vs electric stove correction — affects heating rate and evaporation rate constant k
- Milk fat % variation — formula currently hardcoded to 2% milk
- Ginger/spice extraction dynamics — similar to tea but different compounds
