
function exchange() {
	// pjs.setConnectAttr() is used here to turn off commitment control for this module
	//   to make it easier to use as a proof of concept example
  pjs.setConnectAttr(SQL_ATTR_COMMIT,SQL_TXN_NO_COMMIT);
  
  // define the Rich Display json file
  pjs.defineDisplay("display", "exchange.json");
  
  base = 'USD';  // default value
  while (!close) {

	   // Get exchange rate data from web service
    var response = pjs.sendRequest({
      method: "get",
      uri: "https://api.exchangeratesapi.io/latest?base=" + base
    });
    // Format data for grid
    var gridData = [];
    for (var curr in response.rates) {
    	
    	//check for the base + currency record in the table and then update or insert
      var results = pjs.query(`select * from poclib.exchangep where base = ? and currency = ? `,[base,curr]);
      if(results != null && results.length > 0){
        pjs.query(`update poclib.exchangep set ? 
        where base = ? and currency = ?`,[{rate:response.rates[curr]},base,curr]);
      }
      else{
        pjs.query(`insert into poclib.exchangep (base,currency,rate) values(?,?,?)`,[base,curr,response.rates[curr]]); 
      }

      //add data to array
      gridData.push({
        currency: curr,
        rate: response.rates[curr]
      })
    }
    // replace the data in the display grid with the new array
    display.currencygrid.replaceRecords(gridData);
    
    //display the screen 
    display.exchangedialog.execute();
  }

}

exports.run = exchange;
