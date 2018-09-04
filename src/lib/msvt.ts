/**
 * moonshot value track click
 * call this when user enters the site
 *
 * Created August 28th, 2018
 * @author: ywarezk
 * @version: 0.0.1
 * @copyright: Nerdeez Ltd
 */

declare var require: any;

var URLSearchParams = require('url-search-params/build/url-search-params.js');
var Cookies = require('js-cookie');

export class ValueTrack {

  constructor(public projectName, public siteParams = [], public includeParams = [], public excludeParams = []) {}

  private _getRandomInt = (max): number => {
    return Math.floor(Math.random() * Math.floor(max));
  }

  private _hasQueryParams = (): boolean => {
    return location.search !== "";
  }

  private _buildCustomId = (): string => {
    const customId = `${this.projectName}--${new Date().getTime()}--${this._getRandomInt(20000000)}`
    return btoa(customId)
  }

  private queryToArray = () => {
    const urlSearchParams = new URLSearchParams(location.search);
    const result = {};
    for (let key of urlSearchParams.keys()) {
      result[key] = urlSearchParams.getAll(key);
    }
    return result;
  }

  private _detectSource = (): string => {
    const urlSearchParams = new URLSearchParams(location.search);
    const referer = document.referrer;
    if (urlSearchParams.has('gclid') || referer.indexOf('g_organic') !== -1) return 'google';
    if (urlSearchParams.has('utm_source')) return urlSearchParams.get('utm_source');
    return 'unknownSource';
  }

  private _buildObjectWithQuery = () => {
    const id = this._buildCustomId();
    const queryParams = this.queryToArray();
    const dataObject = {};
    dataObject['id'] = id;
    dataObject['source'] = this._detectSource()
    dataObject['slug'] = `${location.protocol}//${location.host}${location.pathname}`;
    dataObject['final_url'] = location.href;
    dataObject['referrer_host'] = document.referrer;
    dataObject['url_params'] = queryParams;
    dataObject['site_params'] = this.siteParams;
    return dataObject;
  }

  private deleteAllCookies = () => {
    const allCookies = Cookies.get();
    for (let key of Object.keys(allCookies)) {
      if (key.indexOf('msvt') !== -1) {
        Cookies.remove(key);
      }
    }
  }

  private _detectReferrer = () => {
    const referrer = document.referrer;
    if (referrer.indexOf('.google.') !== -1) {
      return 'g_organic';
    }
    if (referrer.indexOf('.bing.') !== -1) {
      return 'b_organic';
    }
    if (referrer.indexOf('.yahoo.') !== -1) {
      return 'y_organic';
    }
    return 'direct';
  }

  public execute = () => {
    if (this._hasQueryParams()) {
      const obj = this._buildObjectWithQuery();

      // check include params
      // this script will continue only if user has one of the include params
      if (this.includeParams.length > 0) {
        for (let v of this.includeParams) {
          if (Object.keys(obj['url_params']).indexOf(v) !== -1) {
            continue;
          } else {
            if (Cookies.get('msvt_cid')) {
              return Cookies.get('msvt_cid')
            }
            Cookies.set('msvt_cid', this._detectReferrer(), { expires: 30 });
            return this._detectReferrer();
          }
        }
      }

      // check if query params has exclude params, abort.
      for (let param of Object.keys(obj['url_params'])) {
        if (this.excludeParams.indexOf(param) !== -1) {
          if (Cookies.get('msvt_cid')) return Cookies.get('msvt_cid')
          const referer = this._detectReferrer();
          Cookies.set('msvt_cid', referer, { expires: 30 });
          return referer;
        }
      }

      // check if custom id param in query, return value from query param;
      if (Object.keys(obj['url_params']).indexOf('mvt') !== -1) {
        return obj['url_params']['mvt'];
      }

      // clear old cookie
      this.deleteAllCookies();

      // send data
      fetch('https://api.valuetrackbi.com/4.0.0/', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json",
        },
      }).then((res) => {
        return res.json();
      }).then((json) => {
        if (json['success']) {
          const id = json['id'];
          Cookies.set('msvt_cid', id, {expires: 30});
          return id;
        } else {
          const ref = this._detectReferrer();
          Cookies.set('msvt_cid', ref, {expires: 30});
          return ref;
        }
      })
    } else {
      if (Cookies.get('msvt_cid')) {
        return Cookies.get('msvt_cid');
      }
      const ref = this._detectReferrer();
      Cookies.set('msvt_cid', ref, {expires: 30});
      return ref;
    }
  }
}
