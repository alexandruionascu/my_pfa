import YahooFinance from 'yfinance';
import FileSystem from 'fs';
import Natural from 'natural';

const COMPANIES_FILE = 'src/companies.json';
const TEXT_ENCODING = 'utf8';

class StockManager {
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
}

module.exports = (robot) => {
  robot.respond(/stock for (.*)/i, (res) => {
    const stockManager = new StockManager();
    console.log(stockManager.getCompany(res.match[1]));

    YahooFinance.getQuotes(res.match[1], (err, data) => {
      if (err) {
        throw err;
      }
      console.log(data);
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