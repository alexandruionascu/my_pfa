import YahooFinance from 'yfinance';
import FileSystem from 'fs';
import Natural from 'natural';

const COMPANIES_FILE = 'src/companies.json';
const TEXT_ENCODING = 'utf8';

export class StockManager {
  constructor() {
    const data = FileSystem.readFileSync(COMPANIES_FILE, TEXT_ENCODING);
    this._companies = JSON.parse(data);
  }

  get companies() {
    return this._companies;
  }

  getCompany(companyName) {
    let maxDistance = 0;
    let bestCompany;
    this.companies.forEach((company) => {
      const distance = Natural.JaroWinklerDistance(company.Name, companyName);
      if (maxDistance < distance) {
        maxDistance = distance;
        bestCompany = company;
      }
    });

    return bestCompany;
  }

  set companies(values) {
    this._companies = values;
  }

  getStockPrice(companyName, callback) {
    const company = this.getCompany(companyName);
    YahooFinance.getQuotes(company.Symbol, (err, data) => {
      if (err) {
        throw err;
      }
      callback(data);
    });
  }
}

module.exports = (robot) => {
  robot.respond(/stockkkkk for (.*)/i, (res) => {
    const stockManager = new StockManager();
    stockManager.getStockPrice(res.match[1], (price) => {
      res.send(price[0].Bid);
    });
  });

  robot.respond(/history for (.*)/i, (res) => {
    YahooFinance.getHistorical(res.match[1], '2016-01-01', '2016-08-05', (err, data) => {
      if (err) {
        throw err;
      }
      console.log(data);
    });
  });
};
