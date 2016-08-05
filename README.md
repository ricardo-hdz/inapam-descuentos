# INAPAM Descuentos
<p align="center">
  <img src="https://raw.githubusercontent.com/ricardo-hdz/inapam-descuentos/master/inapam.png" width="150"/>
</p>

JSON data for all national discounts offered to Mexican senior citizens through [INAPAM](http://www.inapam.gob.mx/) (Instituto Nacional de Las Personas Adultas Mayores)

### How to get the data
```
git clone
npm install
node index.js
```

A set of JSON files will be generated:

| JSON File        | Description           |
| ------------- | :------------- |
| dataCities.json | A list of all discounts grouped by city |
| dataStates.json | A list of all discounts grouped by state |
| dataStatesCities.json | A list of all discounts grouped by state and cities |
| dataStatesMapping.json | A list of all cities that have establishments that offered discounst grouped by state |
| rubros.json | A collection of all industries/services that offered discounts |
| stateNames.json | A collection of all Mexiacn state names |
| states.xml | An xml array of all Mexican state names. Android formatted |

### Raw Data
inapam_descuentos.json Contains the raw JSON data for all discounts
