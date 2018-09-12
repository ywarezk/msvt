/**
 * moonshot sale event
 * Call this when register payment event is happening
 *
 * Created August 30th, 2018
 * @author: ywarezk
 * @version: 0.0.5
 * @copyright: Nerdeez Ltd
 */

declare var require: any;

if (typeof window !== 'undefined') {
  var Cookies = require('js-cookie');
}

export class Affilate {
  private _msvtId: string;

  constructor(public provider: string) {
    this._msvtId = Cookies.get('msvt_cid');
  }

  private _buildObject = (event: string, revenue: number) => {
    const dataObject = {};
    dataObject['id'] = this._msvtId;
    dataObject['provider'] = this.provider;
    dataObject['event'] = event;
    dataObject['revenue'] = revenue;
    return dataObject;
  }

  public execute = (event: string, revenue = 0) => {
    const obj = this._buildObject(event, revenue);
    return fetch('https://api.valuetrackbi.com/sales/1.0.0/', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: {
          "Content-Type": "application/json",
      },
    })
  }
}
