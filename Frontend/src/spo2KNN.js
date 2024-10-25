

export function apneaKNN(inputData, refData, k) {
    const data = processFitbitSpo2(inputData)
    const dists = [];
    const labels = [];
    let minDist = Infinity;
    for (const obj of refData) {
        //data is 30s freqeuency, fitbit is 60s
        const refSpo2 = obj.SpO2.filter((d, i) => i % 2 > 0);
        const refLabel = obj.apnea;
        const tempdist = DTW(data, refSpo2);
        dists.push(tempdist);
        labels.push(refLabel);
        if(tempdist < minDist){ minDist = tempdist}
    }
    const order = argsort(dists);
    const sortedLabels = order.map(i => labels[i]).slice(0,k);
    const sortedDists = order.map(i => dists[i]).slice(0,k);
    if(minDist !== sortedDists[0]){
        console.log('error in dtw knn','order:',order,'selected Dists',sortedDists,'min dist',minDist,'all dists',dists);

    }
    let avg = 0;
    for (const l of sortedLabels) {
        avg += l / sortedLabels.length;
    }
    return avg;
}

const argsort = arr => arr.map((v, i) => [+v, +i]).sort((a,b) => a[0]-b[0]).map(a => a[1]);

function processFitbitSpo2(input) {
    return input
}
// }

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
            dtw[i][j] = cost + Math.min(dtw[i - 1][j],    // Insertion
                dtw[i][j - 1],    // Deletion
                dtw[i - 1][j - 1] // Match
            );
        }
    }

    return dtw[n][m]; // Return the DTW distance
}

export async function fetchSpO2() {
    // console.log('fetching spo2 knn')
    return fetch('https://raw.githubusercontent.com/uic-evl/ApneaSarcopeniaHNC/refs/heads/knn/Python/spo2_apnea_records.json')
        .then(response => {
            // console.log('spo2 knn response', response)
            if (!response.ok) {
                console.log('spo2 fetch error', response)
                return null
            }
            return response.json();
        }).then(data => {
            // console.log('spo2 knn data', data)
            return data
        })
}