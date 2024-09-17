import moment from "moment";

function getTimeIntervalSinceToday(months){
    const today = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(months,'months').format('YYYY-MM-DD');
    return [startDate,today];
}

function toTimestamp(a){
return moment(a.dateOfSleep).unix() * 1000;
}

export default class API {

    constructor(fitbitCookieName,withingsCookieName){
        //token is a jwt token used for password authentication 
        //in this example that is given when the user logs in
        
        this.fitbitCookieName = fitbitCookieName;
        this.withingsCookieName = withingsCookieName;
        this.readTokens();

        //endpoint url is the backend location e.g. http://localhost:<port you ran flask api on?
        // this.fitbitAPI = axios.create({
        //     baseURL: 'https://api.fitbit.com/1/user/',
        //     headers: makeHeader(fitbit),
        // });

        // //clear authentication
        // this.resetToken = ()=> {
        //     localStorage.setItem('token',false)
        //     setAuthToken(false);
        // }
    }

    readTokens(){
        this.fitbitToken = localStorage.getItem(this.fitbitCookieName);
        this.withingsToken = localStorage.getItem(this.withingsCookieName);
    }

    makeHeader(token) {
        const headers = token? {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          } : {};
        return headers;
    }

    async makeQuery(url,method,token,parameters,errorCallback,successCallback){
        const pText = new URLSearchParams();
        if(parameters){
            for(const [key,value] of Object.entries(parameters)){
                pText.append(key,value);
            }
            url = url+'?'+pText.toString();
        }

        return fetch(url, {
            method: method,
            headers: this.makeHeader(token),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error fetching: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if(successCallback){
                successCallback(data);
            }
            return data;
        })
        .catch((error) => {
            if (errorCallback){
                errorCallback(error);
            } else{
                console.error("Error fetching",url, error);
            }
            return null;
        });
    }

    async fetchFitbitProfile(){
        const accessToken = this.fitbitToken;
        return this.makeQuery("https://api.fitbit.com/1/user/-/profile.json",'GET',accessToken)
    }

    async fetchFitbitSleepLog(startDate){
        const accessToken = this.fitbitToken;
        const args = {
            'afterDate': startDate,
            'sort': 'desc',
            'limit': 100,
            'offset':0,
        }
        return this.makeQuery("https://api.fitbit.com/1.2/user/-/sleep/list.json",'GET',accessToken,args);
    }

    async fetchFitbitHeartRate(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1/user/-/activities/heart/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitSpO2(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1/user/-/spo2/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitSleepLogRange(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1.2/user/-/sleep/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitStepsRange(start,end){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1/user/-/activities/steps/date/${start}/${end}.json`,'GET',accessToken);
    }

    async fetchFitbitSleepLogByDate(date){
        const accessToken = this.fitbitToken;
        return this.makeQuery(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`,'GET',accessToken);

    }

    async getStepsSince(months){
        const [start,stop] = getTimeIntervalSinceToday(3);
        const tempData = await this.fetchFitbitStepsRange(start,stop);
        if(tempData !== null){
            return tempData['activities-steps'];
        }
        return null
    }
    

    async getSleepSince(months){
        const [start,stop] = getTimeIntervalSinceToday(3);
        const tempSleepData = await this.fetchFitbitSleepLogRange(start,stop);
        if(tempSleepData !== null){
            const temp = tempSleepData.sleep.map((log) => ({
                ...log,
                timestamp: toTimestamp(log.dateOfSleep),
                }))
                .sort((a, b) => a.timestamp - b.timestamp);
            return temp
        }
        return null
    }
    

    getParamList(pObj){
        //returns an object and turns the entries into a url query
        //e.g {key: value} => http://localhost:<port>/location?key=value
        let newParams = {}
        let empty= true;
        for(let k of Object.keys(pObj)){
            if(pObj[k] !== undefined & pObj[k] !== null){
                newParams[k] = pObj[k];
                empty = false;
            }
        }
        let paramQuery = '';
        if(!empty){
            let pstring = new URLSearchParams(newParams);
            paramQuery = paramQuery + '?' + pstring
        }
        return paramQuery
    }
}