import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import gplay from 'google-play-scraper';
import { FileSaver } from 'file-saver';
import { saveAs } from 'file-saver/FileSaver';

// const CATEGORIES = [
//   gplay.category.APPLICATION,
//   gplay.category.ANDROID_WEAR,
//   gplay.category.ART_AND_DESIGN,
//   gplay.category.AUTO_AND_VEHICLES,
//   gplay.category.BEAUTY,
//   gplay.category.BOOKS_AND_REFERENCE,
//   gplay.category.BUSINESS,
//   gplay.category.COMICS,
//   gplay.category.COMMUNICATION,
//   gplay.category.DATING,
//   gplay.category.EDUCATION,
//   gplay.category.ENTERTAINMENT,
//   gplay.category.EVENTS,
//   gplay.category.FINANCE,
//   gplay.category.FOOD_AND_DRINK,
//   gplay.category.HEALTH_AND_FITNESS,
//   gplay.category.HOUSE_AND_HOME,
//   gplay.category.LIBRARIES_AND_DEMO,
//   gplay.category.LIFESTYLE,
//   gplay.category.MAPS_AND_NAVIGATION,
//   gplay.category.MEDICAL,
//   gplay.category.MUSIC_AND_AUDIO,
//   gplay.category.NEWS_AND_MAGAZINES,
//   gplay.category.PARENTING,
//   gplay.category.PERSONALIZATION,
//   gplay.category.PHOTOGRAPHY,
//   gplay.category.PRODUCTIVITY,
//   gplay.category.SHOPPING,
//   gplay.category.SOCIAL,
//   gplay.category.SPORTS,
//   gplay.category.TOOLS,
//   gplay.category.TRAVEL_AND_LOCAL,
//   gplay.category.VIDEO_PLAYERS,
//   gplay.category.WEATHER,
//   gplay.category.GAME,
//   gplay.category.GAME_ACTION,
//   gplay.category.GAME_ADVENTURE,
//   gplay.category.GAME_ARCADE,
//   gplay.category.GAME_BOARD,
//   gplay.category.GAME_CARD,
//   gplay.category.GAME_CASINO,
//   gplay.category.GAME_CASUAL,
//   gplay.category.GAME_EDUCATIONAL,
//   gplay.category.GAME_MUSIC,
//   gplay.category.GAME_PUZZLE,
//   gplay.category.GAME_RACING,
//   gplay.category.GAME_ROLE_PLAYING,
//   gplay.category.GAME_SIMULATION,
//   gplay.category.GAME_SPORTS,
//   gplay.category.GAME_STRATEGY,
//   gplay.category.GAME_TRIVIA,
//   gplay.category.GAME_WORD,
//   gplay.category.FAMILY,
//   gplay.category.FAMILY_ACTION,
//   gplay.category.FAMILY_BRAINGAMES,
//   gplay.category.FAMILY_CREATE,
//   gplay.category.FAMILY_EDUCATION,
//   gplay.category.FAMILY_MUSICVIDEO,
//   gplay.category.FAMILY_PRETEND,
// ];

// const COLLECTIONS = [
//   gplay.collection.TOP_FREE,
//   gplay.collection.TOP_PAID,
//   gplay.collection.NEW_FREE,
//   gplay.collection.NEW_PAID,
//   gplay.collection.GROSSING,
//   gplay.collection.TRENDING,
// ];
//   gplay.category.GAME,
//   gplay.category.GAME_ACTION,
//   gplay.category.GAME_ADVENTURE,
//   gplay.category.GAME_ARCADE,
//   gplay.category.GAME_BOARD,
//   gplay.category.GAME_CARD,
//   gplay.category.GAME_CASINO,
//   gplay.category.GAME_CASUAL,
//   gplay.category.GAME_EDUCATIONAL,
//   gplay.category.GAME_MUSIC,
//   gplay.category.GAME_PUZZLE,
//   gplay.category.GAME_RACING,
//   gplay.category.GAME_ROLE_PLAYING,
//   gplay.category.GAME_SIMULATION,
//   gplay.category.GAME_SPORTS,
//   gplay.category.GAME_STRATEGY,
//   gplay.category.GAME_TRIVIA,
//   gplay.category.GAME_WORD,
const COLLECTIONS = [gplay.collection.NEW_FREE];
const CATEGORIES = [gplay.category.GAME_WORD];
const FILENAME = "GooglePlayApps-" + CATEGORIES[0] + "-" + COLLECTIONS[0];

var NumRequestAppList = 0;
var NumResponseAppList = 0;
var NumRequestApp = 0;
var NumResponseApp = 0;

var AppIds = [];
var AppDetails = [];
class App extends Component {


  constructor(props) {
    super(props);
  }


  render() {
    return (
      <div className="App">
        <button onClick={this.startCrawling.bind(this)}>START CRAWLING</button>
      </div>
    );
  }

  startCrawling() {
    console.log('startCrawling');
    //var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
    //saveAs(blob, "hello world.txt");
    //return;


    for (var collectionIdx in COLLECTIONS) {
      for (var categoryIdx in CATEGORIES) {
        this.gplayList(CATEGORIES[categoryIdx], COLLECTIONS[collectionIdx])
        // gplay.list({
        //   category: categories[categoryIdx],
        //   collection: collections[collectionIdx],
        //   num: 2
        // }).then(console.log, console.log);
      }
    }
  }

  gplayList(category, collection) {
    console.log("category : ", category);
    console.log("collection : ", collection);

    for( var startIdx = 0; startIdx < 500; startIdx += 100) {
      NumRequestAppList += 1;
      gplay.list({
        category: category,
        collection: collection,
        num: 100,
        start: startIdx,
      }).then((response) => {

        for (var it in response) {
          AppIds.push(response[it].appId);
        }
        this.gplayListFinalProcess();
      }, (reason)=>{
        console.log('failed to gplayList', reason);
        this.gplayListFinalProcess();
      });
    }    
  }
  
  gplayListFinalProcess() {
    NumResponseAppList += 1;
    console.log("NumRequestAppList : ", NumRequestAppList, "NumResponseAppList : ", NumResponseAppList);
    if (NumRequestAppList == NumResponseAppList) {
      this.collectAppDetails();
    }
  }
  

  collectAppDetails() {
    console.log('collectAppDetails');
    console.log(AppIds);

    for (var it in AppIds) {
      this.gplayApp(AppIds[it]);
    }
  }

  gplayApp(appId) {

    NumRequestApp += 1;
    gplay.app({ appId: appId })
      .then((response) => {

          AppDetails.push(response);
          //console.log(response[it].appId);
          this.gplayAppFinalProcess();
      }, (reason)=>{
        console.log('failed to gplayApp', reason);
        this.gplayAppFinalProcess();
      });
  }

  gplayAppFinalProcess() {
    NumResponseApp += 1;
    console.log("NumRequestApp : ", NumRequestApp, "NumResponseApp : ", NumResponseApp);
    if (NumRequestApp == NumResponseApp) {
      this.startDownload();
    }
  }

  startDownload() {
    
    var blob = new Blob([JSON.stringify(AppDetails)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, FILENAME);
    
    
  }

}



export default App;
