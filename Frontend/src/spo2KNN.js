const argsort = (arr) =>
  arr
    .map((v, i) => [+v, +i])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);

export function apneaKNN(inputData, refData, k) {
  const data = processFitbitSpo2(inputData);
  const dists = [];
  const labels = [];
  let minDist = Infinity;

  for (const obj of refData) {
    // Convert refData SpO2 from 30s to 60s by averaging pairs of 30s intervals
    const refSpo2 = [];
    for (let i = 0; i < obj.SpO2.length; i += 2) {
      const minuteAvg = (obj.SpO2[i] + (obj.SpO2[i + 1] || obj.SpO2[i])) / 2; // Handle last odd point if any
      refSpo2.push(minuteAvg);
    }

    const refLabel = obj.apnea;

    // Calculate DTW distance between minute-level `data` and `refSpo2`
    const tempdist = DTW(data, refSpo2);
    dists.push(tempdist);
    labels.push(refLabel);

    if (tempdist < minDist) {
      minDist = tempdist;
    }
  }

  const order = argsort(dists);
  const sortedLabels = order.map((i) => labels[i]).slice(0, k);
  const sortedDists = order.map((i) => dists[i]).slice(0, k);
  const neighbors = order.map((i) => refData[i]).slice(0, k);
  if (minDist !== sortedDists[0]) {
    console.log(
      "error in dtw knn",
      "order:",
      order,
      "selected Dists",
      sortedDists,
      "min dist",
      minDist,
      "all dists",
      dists
    );
  }
  let avg = 0;
  for (const l of sortedLabels) {
    avg += l / sortedLabels.length;
  }
  return { knnScore: avg, neighbors: neighbors };
}

function processFitbitSpo2(input) {
  return input;
}

function DTW(s, t, window = Infinity) {
  const n = s.length;
  const m = t.length;

  // Initialize the DTW matrix
  const dtw = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
  dtw[0][0] = 0; // Starting point

  // Define the window size
  const w = Math.max(window, Math.abs(n - m)); // Effective window size

  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(1, i - w); j <= Math.min(m, i + w); j++) {
      const cost = Math.abs(s[i - 1] - t[j - 1]); // Cost function
      dtw[i][j] =
        cost +
        Math.min(
          dtw[i - 1][j], // Insertion
          dtw[i][j - 1], // Deletion
          dtw[i - 1][j - 1] // Match
        );
    }
  }

  return dtw[n][m]; // Return the DTW distance
}

function mean(arr) {
  if (arr.length < 1) {
    return null;
  }
  let mval = 0;
  for (const val of arr) {
    mval += val;
  }
  return mval / arr.length;
}

export function spo2ApneaRules(spo2Array) {
  const data = processFitbitSpo2(spo2Array);
  const meanval = mean(data);
  let stdval = 0;
  let under91Count = 0;
  let under85count = 0;
  for (const val of data) {
    stdval += (val - meanval) ** 2;
    if (val < 91) {
      under91Count += 1 / data.length;
      if (val < 88) {
        under85count += 1 / data.length;
      }
    }
  }
  stdval = stdval / data.length;
  const stdRule = stdval >= 1.375;
  const under91Rule = under91Count >= 0.023;
  const under85Rule = under85count >= 0.001;
  return [stdRule, under91Rule, under85Rule];
}

export function spo2ApneaPrediction(spo2Data, refData, k) {
  const [stdRule, under91Rule, under85Rule] = spo2ApneaRules(spo2Data);
  let knnRes = apneaKNN(spo2Data, refData, k);
  knnRes["stdRule"] = stdRule;
  knnRes["under91Rule"] = under91Rule;
  knnRes["under85Rule"] = under85Rule;
  knnRes["totalScore"] =
    knnRes.knnScore / 2 + (stdRule + under91Rule + under85Rule) / 6;
  return knnRes;
}

export async function fetchSpO2() {
  // console.log('fetching spo2 knn')
  return fetch(
    "https://raw.githubusercontent.com/uic-evl/ApneaSarcopeniaHNC/refs/heads/knn/Python/spo2_apnea_records.json"
  )
    .then((response) => {
      // console.log('spo2 knn response', response)
      if (!response.ok) {
        console.log("spo2 fetch error", response);
        return null;
      }
      return response.json();
    })
    .then((data) => {
      // console.log('spo2 knn data', data)
      return data;
    });
}
