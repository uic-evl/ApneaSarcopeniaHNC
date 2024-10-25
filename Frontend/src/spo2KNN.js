

const [apneaModel, setApneaModel] = useState(null);

async function makeApneaModel(){
  const spo2data = await fetchSpO2();
  if(spo2data !== null){
    console.log('spo2 knn data',spo2data);
    setApneaModel(new ApneaKNN(spo2data));
  }
}
export class ApneaKNN {

    constructor(spo2data) {
        this.spo2Data = spo2data;
    }

    getPrediction(inputData, k = 5) {
        const data = this.processFitbitSpo2(inputData)
        const dists = [];
        const labels = [];
        for (const obj of this.spo2Data) {
            //data is 30s freqeuency, fitbit is 60s
            const refSpo2 = obj.SpO2.filter((d,i) => i%2 > 0);
            const refLabel = obj.apnea;
            const tempdist = DTW(data, refSpo2);
            if (dists.length < 1) {
                dists.push(tempdist);
                labels.push(refLabel);
            } else {
                let flag = false;
                for (const i in dists) {
                    const currDist = dists[+i]
                    if (tempdist < currDist) {
                        dists.splice(+i, 0, tempdist);
                        labels.splice(+i, 0, refLabel);
                        flag = true;
                        break
                    }
                }
                if (dists.length > k) {
                    dists.pop();
                    labels.pop();
                }
                if (dists.length < k && flag) {
                    dists.push(tempdist);
                    labels.push(refLabel);
                }
            }
        }
        console.log('knn here',dists,labels);
        let avg = 0;
        for(const l of labels){
            avg += l/labels.length;
        }
        return avg;
    }

    processFitbitSpo2(input) {
        return input
    }
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
            dtw[i][j] = cost + Math.min(dtw[i - 1][j],    // Insertion
                dtw[i][j - 1],    // Deletion
                dtw[i - 1][j - 1] // Match
            );
        }
    }

    return dtw[n][m]; // Return the DTW distance
}

export async function fetchSpO2() {
    console.log('fetching spo2 knn')
    fetch('https://raw.githubusercontent.com/uic-evl/ApneaSarcopeniaHNC/refs/heads/knn/Python/spo2_apnea_records.json')
        .then(response => {
            console.log('spo2 knn response', response)
            if (!response.ok) {
                console.log('spo2 fetch error', response)
                return null
            }
            return response.json();
        }).then(data => {
            console.log('spo2 knn data', data)
            return data
        })
}