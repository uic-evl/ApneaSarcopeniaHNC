import moment from "moment";
import { useNavigate } from "react-router-dom";
import * as env from "../env.js";

function getTimeIntervalSinceToday(months){
    const today = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(months,'months').format('YYYY-MM-DD');
    return [startDate,today];
}

function toTimestamp(a){
    return moment(a.dateOfSleep).unix() * 1000;
}

//https://developer.withings.com/api-reference#tag/measure/operation/measure-getmeas
const withingsKeys = {
    'weight': 1,//kg
    'height': 4,//meter
    'fat_free_mass': 5,//kg
    'fat_ratio': 6,//%
    'fat_mass_weight': 8,//kg
    'spo2': 54,//%
    'muscle_mass': 76,//kg
    'bone_mass': 88,//kg

}

export default class API {

    constructor(fitbitCookieName,withingsCookieName){
        //token is a jwt token used for password authentication 
        //in this example that is given when the user logs in
        
        this.fitbitCookieName = fitbitCookieName;
        this.withingsCookieName = withingsCookieName;
        this.readTokens();
        this.navigate = useNavigate();
        if(sessionStorage.getItem('refreshing-withings') === null){
            sessionStorage.setItem('refreshing-withings',false);
        }
        if(sessionStorage.getItem('refreshing-fitbit') === null){
            sessionStorage.setItem('refreshing-fitbit',false);
        }
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

    async makeFitbitQuery(url,parameters,errorCallback,successCallback){
        //todo: figure out how to handle expired token codes
        const token = localStorage.getItem(this.fitbitCookieName);
        if (this.isFitbitExpired()){
            await this.refreshFitbitToken()
        }
        const pText = new URLSearchParams();
        if(parameters){
            for(const [key,value] of Object.entries(parameters)){
                pText.append(key,value);
            }
            url = url+'?'+pText.toString();
        }
        var stuff = {
            method: "GET",
            headers: this.makeHeader(token),
        }
        return fetch(url, stuff)
        .then((response) => {
            if (response.status === 401){
                this.resetFitbitToken();
            }
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

    isWithingsExpired(){
        const currTime = new Date().getTime() / 1000;
        const expireTime = localStorage.getItem(this.withingsCookieName+'-expires')
        if(expireTime === null){
            console.log('withing expire thing no work');
        }
        return (currTime >= Number(expireTime) - 1)
    }

    isFitbitExpired(){
        const currTime = new Date().getTime() / 1000;
        const expireTime = localStorage.getItem(this.fitbitCookieName+'-expires')
        if(expireTime === null){
            console.log('fitbit expire thing no work');
            return false;
        }
        return (currTime >= Number(expireTime) - 1)
    }

    async makeWithingsRequest(parameters,successCallback,errorCallback){
        //todo: handle expired codes
        const token = localStorage.getItem(this.withingsCookieName);
        if(token === null){
            console.log('withings token missing');
        }
        if (this.isWithingsExpired()){
            await this.refreshWhithingsToken()
        }
        const url = 'https://wbsapi.withings.net/measure';
        const pText = new URLSearchParams();
        for(const [key,value] of Object.entries(parameters)){
            pText.append(key,value);
        }
        var stuff = {
            method: 'POST',
            headers: this.makeHeader(token),
            body: pText,
        }
        return fetch(url, stuff)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error fetching withings: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if(successCallback){
                    successCallback(data);
                }
                if(data.status === 401){
                    this.resetWithingsToken();
                }
                return data.body.measuregrps;
            })
            .catch((error) => {
                if (errorCallback){
                    errorCallback(error);
                } else{
                    console.error("Error fetching withings",url, error);
                }
                return null;
            });
    }

    //todo: figure out refresh tokens
    resetWithingsToken(){
        localStorage.removeItem(this.withingsCookieName);
        localStorage.removeItem(this.withingsCookieName+'-expires');
        localStorage.removeItem(this.withingsCookieName+'-refresh');
        sessionStorage.removeItem('refreshing-withings');
        this.navigate('/')
    }

    resetFitbitToken(){
        localStorage.removeItem(this.fitbitCookieName);
        localStorage.removeItem(this.fitbitCookieName+'-expires');
        localStorage.removeItem(this.fitbitCookieName+'-refresh');
        sessionStorage.remoteItem('refreshing-fitbit');
        this.navigate('/')
    }

    logOut(){
        localStorage.removeItem(this.fitbitCookieName);
        localStorage.removeItem(this.fitbitCookieName+'-expires');
        localStorage.removeItem(this.fitbitCookieName+'-refresh');

        localStorage.removeItem(this.withingsCookieName);
        localStorage.removeItem(this.withingsCookieName+'-expires');
        localStorage.removeItem(this.withingsCookieName+'-refresh');

        sessionStorage.removeItem('refreshing-fitbit');
        sessionStorage.removeItem('refreshing-withings');

        this.navigate('/');
    }

    async fetchWithingsEntry(item,startDate,endDate){
        const entry  = {
            "action": "getmeas",
            "category": "1",  //  1 for real measures, 2 for user objectives.
        }
        
        const key = withingsKeys[item.toLowerCase()];
        if(key === undefined){
            console.log('invalid key',item);
            return null
        }
        entry['meastype'] = key
        if(startDate && endDate){
            entry['startdate'] = startDate;
            entry['endDate'] = endDate;
        }
        return this.makeWithingsRequest(entry);
    }

    async fetchFitbitProfile(){
        return this.makeFitbitQuery("https://api.fitbit.com/1/user/-/profile.json")
    }

    async fetchFitbitSleepLog(startDate){
        const args = {
            'afterDate': startDate,
            'sort': 'desc',
            'limit': 100,
            'offset':0,
        }
        return this.makeFitbitQuery("https://api.fitbit.com/1.2/user/-/sleep/list.json",args);
    }

    async fetchFitbitHeartRate(start,end){
        return this.makeFitbitQuery(`https://api.fitbit.com/1/user/-/activities/heart/date/${start}/${end}.json`);
    }

    async fetchFitbitSpO2(start,end){
        return this.makeFitbitQuery(`https://api.fitbit.com/1/user/-/spo2/date/${start}/${end}.json`);
    }

    async fetchFitbitSleepLogRange(start,end){
        return this.makeFitbitQuery(`https://api.fitbit.com/1.2/user/-/sleep/date/${start}/${end}.json`);
    }

    async fetchFitbitStepsRange(start,end){
        return this.makeFitbitQuery(`https://api.fitbit.com/1/user/-/activities/steps/date/${start}/${end}.json`);
    }

    async fetchFitbitSleepLogByDate(date){
        return this.makeFitbitQuery(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`);

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

    async refreshWhithingsToken(){
        // Prepare the body for the POST request
        const token = localStorage.getItem(this.withingsCookieName+'-refresh');
        if (token === null){ refreshWithingsToken() }
        if (sessionStorage.getItem('refreshing-withings') === true){ return }
        sessionStorage.setItem('refreshing-withings',true)
        const body = new URLSearchParams();
        body.append("client_id", env.WHITHINGS_CLIENT_ID);
        body.append("grant_type", "refresh_token");
        body.append('client_secret',env.WHITHINGS_SECRET)
        body.append("action", 'requesttoken');
        body.append('refresh_token',token);
        const tokenUrl = "https://wbsapi.withings.net/v2/oauth2";
        console.log('whithing body',body.toString())
        fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(), // The body must be URL-encoded
        })
          .then((response) => {
            console.log('whithing refresh token response',response)
            return response.json();
          })
          .then((data) => {
            console.log("whithing refrehsh body",data);
            if (data.body.access_token) {
                const atoken = data.body.access_token;
                console.log("Whiting Refrheshed Access Token:", atoken);

                // TODO: Store the access token in the local storage as well
                localStorage.setItem(this.withingsCookieName, atoken);
                localStorage.setItem(this.withingsCookieName+"-refresh",data.body.refresh_token);
                sessionStorage.setItem('refreshing-withings',false);

                //save when the token expires
                const currTime = new Date().getTime() / 1000;
                const expireTime =  currTime + data.body.expires_in;
                localStorage.setItem(this.withingsCookieName+'-expires',expireTime);

            } else {
              console.error("Error refreshing withings access token:", data);
              sessionStorage.setItem('refreshing-withings',false);
              this.resetWithingsToken();
            }
            
          })
          .catch((error) => {
            console.error("Error during withing token refresh:", error);
            sessionStorage.setItem('refreshing-withings',false);
            this.resetWithingsToken();
          });
      }

      async refreshFitbitToken(){
        const token = localStorage.getItem(this.fitbitCookieName+'-refresh');
        if (token === null){ resetFitbitToken() }
        if (sessionStorage.getItem('refreshing-fitbit') === true){ return }
        sessionStorage.setItem('refreshing-fitbit',true);
        const body = new URLSearchParams();
        body.append("client_id", env.FITBIT_CLIENT_ID);
        body.append("grant_type", "refresh_token");
        body.append("code_verifier", env.VERIFIER);
        body.append('refresh_token',token);
        const tokenUrl = "https://api.fitbit.com/oauth2/token";
        // console.log('body',body.toString())
        fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(), // The body must be URL-encoded
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.access_token) {
              console.log("Fitbit refresh Access Token:", data);
              // TODO: Store the access token in the local storage as well
              localStorage.setItem(this.fitbitCookieName, data.access_token);
              localStorage.setItem(this.fitbitCookieName+'-refresh',data.refresh_token);
    
              //save when token expires
              const currTime = new Date().getTime() / 1000;
              const expireTime =  currTime + data.expires_in;
              console.log('refresh expires in')
              localStorage.setItem(this.fitbitCookieName+'-expires',expireTime);
    
              sessionStorage.setItem('refreshing-fitbit',false);
            } else {
              console.error("Error fetching refresh access token:", data);
              sessionStorage.setItem('refreshing-fitbit',false);
            //   this.resetFitbitToken();
            }
            
          })
          .catch((error) => {
            console.error("Error during fitibt token refresh:", error);
            sessionStorage.setItem('refreshing-fitbit',false);
            // this.resetFitbitToken();
          });
      }
}