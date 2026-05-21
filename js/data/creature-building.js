export const CREATURE_BUILD = {
  ac: {
    extreme: {
      "-1": 18,
      0: 19,
      1: 19,
      2: 21,
      3: 22,
      4: 24,
      5: 25,
      6: 27,
      7: 28,
      8: 30,
      9: 31,
      10: 33,
      11: 34,
      12: 36,
      13: 37,
      14: 39,
      15: 40,
      16: 42,
      17: 43,
      18: 45,
      19: 46,
      20: 48,
      21: 49,
      22: 51,
      23: 52,
      24: 54
    },

    high: {
      "-1": 15,
      0: 16,
      1: 17,
      2: 18,
      3: 19,
      4: 21,
      5: 22,
      6: 24,
      7: 25,
      8: 27,
      9: 28,
      10: 30,
      11: 31,
      12: 33,
      13: 34,
      14: 36,
      15: 37,
      16: 39,
      17: 40,
      18: 42,
      19: 43,
      20: 45,
      21: 46,
      22: 48,
      23: 49,
      24: 51
    },

    moderate: {
      "-1": 14,
      0: 15,
      1: 16,
      2: 18,
      3: 19,
      4: 20,
      5: 22,
      6: 23,
      7: 25,
      8: 26,
      9: 28,
      10: 29,
      11: 31,
      12: 32,
      13: 34,
      14: 35,
      15: 37,
      16: 38,
      17: 40,
      18: 41,
      19: 43,
      20: 44,
      21: 46,
      22: 47,
      23: 49,
      24: 50
    },

    low: {
      "-1": 12,
      0: 13,
      1: 14,
      2: 15,
      3: 16,
      4: 18,
      5: 19,
      6: 21,
      7: 22,
      8: 24,
      9: 25,
      10: 27,
      11: 28,
      12: 30,
      13: 31,
      14: 33,
      15: 34,
      16: 36,
      17: 37,
      18: 39,
      19: 40,
      20: 42,
      21: 43,
      22: 45,
      23: 46,
      24: 48
    }
  }
};

function classifyValue(value, table, level) {

  const extreme = table.extreme[level];
  const high = table.high[level];
  const moderate = table.moderate[level];
  const low = table.low[level];

  if (value >= extreme) {
    return {
      rating: "extreme",
      color: "blue"
    };
  }

  if (value >= high) {
    return {
      rating: "high",
      color: "green"
    };
  }

  if (value >= moderate) {
    return {
      rating: "moderate",
      color: "gray"
    };
  }

  if (value >= low) {
    return {
      rating: "low",
      color: "orange"
    };
  }

  return {
    rating: "terrible",
    color: "red"
  };
}
