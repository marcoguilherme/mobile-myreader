import { Component } from '@angular/core';

import { NavController, LoadingController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { Http } from '@angular/http';

import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public feeds: any;
  private url: string = "https://www.reddit.com/new.json";
  private olderPosts: string = "https://www.reddit.com/new.json?after=";
  private newerPosts: string = "https://www.reddit.com/new.json?before=";

  constructor(public navCtrl: NavController, public http: Http, public loadingCtrl: LoadingController, public iab: InAppBrowser) {

    this.fetchContent();

  }

  //Lista o conteudo utilizando o loader
  fetchContent():void {
    let loading = this.loadingCtrl.create({
      content: 'Loading...'
    })
    
    loading.present();

    this.http
      .get(this.url)
      .map(res => res.json())
      .subscribe( data => {
        this.feeds = data.data.children;
        this.changeThumbnail(this.feeds);
        loading.dismiss();
      });
      
  }

  //Abre conteudo da url ema nova guia do browser
  itemSelected (url: string) {

    this.iab.create(url, '_system');

  }

  changeThumbnail(feeds){
    feeds.forEach((e, i, a) => {
      if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) { 
        e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
      }
    })
  }
  
  //Comando para recarregar novo conteudo
    doRefresh(refresher) {
 
    let paramsUrl = this.feeds[0].data.name;
 
    this.http.get(this.newerPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {
      
        this.feeds = data.data.children.concat(this.feeds);

        this.changeThumbnail(this.feeds);
        
        refresher.complete();
      });
  } 
  
  //Comando para fazer scroll infinito
  doInfinite(infiniteScroll) {
  
    let paramsUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : "";
     
    this.http.get(this.olderPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {      
        this.feeds = this.feeds.concat(data.data.children);
        this.changeThumbnail(this.feeds);
        infiniteScroll.complete();  
      }, errors => console.log("")); 
  }  

}
