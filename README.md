## Moonshot's Click And Sale Data JS-SDK

### Install

Install the library using npm

```
npm install msvt --save
```

### Click

```
import {ValueTrack} from 'msvt';
const valueTrack = new ValueTrack('bugeez.io', undefined, ['gclid']);
valueTrack.execute();
```

### Sale

```
import {Affilate} from 'msvt';
const affiliate = new Affilate('bugeez.io');
affiliate.execute('signup');
```


