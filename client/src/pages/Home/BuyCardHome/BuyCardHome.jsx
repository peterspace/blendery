import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BuyCardScreen1 } from './BuyCardScreen1';
import { BuyCardScreen2 } from './BuyCardScreen2';
import { BuyCardScreen3 } from './BuyCardScreen3';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionRate } from '../../../redux/features/transaction/transactionSlice';
import {
  getTokenExchangeRate,
  getTransactionRateInfo,
} from '../../../services/apiService';

//w-[370px] ===w-[300px]
//w-[375px] === w-[320px] xs:w-[340px]
const paymentOptions = ['card', 'cash'];
const providers = [
  {
    name: 'Phone',
    url: '/image@2x.png',
    rate: '0.00526',
    class: 'bg-gray-200',
    providerUrl: 'https://www.simplex.com/',
  },
  {
    name: 'Card',
    url: '/MoonPay.png',
    rate: '0.00519',
    providerUrl: 'https://www.moonpay.com',
  },
];

const cities = [
  {
    country: 'United States',
    cities: ['New york'],
    flag: '',
  },
  {
    country: 'United Kingdom',
    cities: ['London'],
    flag: '',
  },
  {
    country: 'France',
    cities: ['Paris'],
    flag: '',
  },

  {
    country: 'Germany',
    cities: ['Berlin'],
    flag: '',
  },
  {
    country: 'Spain',
    cities: ['Barcelona'],
    flag: '',
  },
  {
    country: 'Russia',
    cities: ['Saint Petersburg', 'Moscow'],
    flag: '',
  },
  {
    country: 'Finland',
    cities: ['Helsinki'],
    flag: '',
  },
  {
    country: 'Hungary',
    cities: ['Budapest'],
    flag: '',
  },
  {
    country: 'Czech',
    cities: ['Prague'],
    flag: '',
  },
];

export const BuyCardHome = (props) => {
  const {
    mode,
    user,
    service,
    subService,
    txInfo,
    setTxInfo,
    setService,
    setSubService,
    percentageProgress,
    setPercentageProgress,
  } = props;

  const location = useLocation();

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     REDUX STATES    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  const dispatch = useDispatch();
  const allTokensFromL = useSelector((state) => state.token?.tokenListFiat); // send money to get token
  const allTokensToL = useSelector((state) => state.token?.tokenListBuy); //

  const [allTokensFrom, setAllTokensFrom] = useState(allTokensFromL || null);
  const [allTokensTo, setAllTokensTo] = useState(allTokensToL || null);

  //======================={RATES and PRICES}========================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRate, setExchangeRate] = useState('0');
  console.log({ exchangeRate: exchangeRate });
  const [transactionRates, setTransactionRates] = useState(0);
  const tValue = transactionRates ? transactionRates?.tValueFormatted : 0;


  const fTokenL = localStorage.getItem('fTokenE')
    ? JSON.parse(localStorage.getItem('fTokenE'))
    : null;

  const [fToken, setFromToken] = useState();
  const tTokenL = localStorage.getItem('tTokenE')
    ? JSON.parse(localStorage.getItem('tTokenE'))
    : null;
  const [tToken, setToToken] = useState();
  const fValueL = localStorage.getItem('fValueE')
    ? JSON.parse(localStorage.getItem('fValueE'))
    : 150;
  const [fValue, setFromValue] = useState(150);

  const [fTitle, setFTitle] = useState('You give');
  const [tTitle, setTTitle] = useState('You get');
  //=============={Exchange1of4}=======================================

  const userAddressL = localStorage.getItem('userAddress')
    ? JSON.parse(localStorage.getItem('userAddress'))
    : null;

  const [userAddress, setUserAddress] = useState(userAddressL);

  //=============={Exchange3of4}=======================================

  const telegramL = localStorage.getItem('telegram')
    ? JSON.parse(localStorage.getItem('telegram'))
    : null;

  const [telegram, setTelegram] = useState(telegramL);

  const paymentMethodL = localStorage.getItem('paymentMethod')
    ? JSON.parse(localStorage.getItem('paymentMethod'))
    : paymentOptions[0];

  const [paymentMethod, setPaymentMethod] = useState(paymentMethodL);

  const countryL = localStorage.getItem('country')
    ? JSON.parse(localStorage.getItem('country'))
    : cities[0]?.country;

  const cityDataL = localStorage.getItem('cityData')
    ? JSON.parse(localStorage.getItem('cityData'))
    : null;
  const cityL = localStorage.getItem('city')
    ? JSON.parse(localStorage.getItem('city'))
    : null;

  const [country, setCountry] = useState(countryL);
  const [cityData, setCityData] = useState(cityDataL);
  const [city, setCity] = useState(cityL);

  console.log({
    city: city,
    cityData: cityData,
    country: country,
  });

  const providerL = localStorage.getItem('provider')
    ? JSON.parse(localStorage.getItem('provider'))
    : providers[0];
  // const [provider, setProvider] = useState(providers[0]); // important
  const [provider, setProvider] = useState(providerL); // important
  console.log({ providerActive: provider });

  //====================================================================================================
  //======================================={BANK INFO}==================================================
  //====================================================================================================

  const fullNameL = localStorage.getItem('fullName')
    ? JSON.parse(localStorage.getItem('fullName'))
    : null;

  const bankNameL = localStorage.getItem('bankName')
    ? JSON.parse(localStorage.getItem('bankName'))
    : null;
  const cardNumberL = localStorage.getItem('cardNumber')
    ? JSON.parse(localStorage.getItem('cardNumber'))
    : null;

  const phoneL = localStorage.getItem('phone')
    ? JSON.parse(localStorage.getItem('phone'))
    : null;

  const [fullName, setFullName] = useState(fullNameL);
  const [bankName, setBankName] = useState(bankNameL);
  const [cardNumber, setCardNumber] = useState(cardNumberL);
  const [phone, setPhone] = useState(phoneL);

  /************************************************************************************** */
  /******************************{BANK PAYMENT INFORMATION}****************************** */
  /************************************************************************************** */

  useEffect(() => {
    if (fullName) {
      localStorage.setItem('fullName', JSON.stringify(fullName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankName]);
  useEffect(() => {
    if (bankName) {
      localStorage.setItem('bankName', JSON.stringify(bankName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankName]);
  useEffect(() => {
    if (cardNumber) {
      localStorage.setItem('cardNumber', JSON.stringify(cardNumber));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardNumber]);
  useEffect(() => {
    if (phone) {
      localStorage.setItem('phone', JSON.stringify(phone));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  //====================================================================================================
  //======================================={MAIN TRANSACTION CALLS}=====================================
  //====================================================================================================
  //======================================================================================================

  useEffect(() => {
    if (allTokensFromL) {
      setAllTokensFrom(allTokensFromL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allTokensToL) {
      setAllTokensTo(allTokensToL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (allTokensFromL && !fToken) {
      setFromToken(allTokensFromL[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensFromL]);

  useEffect(() => {
    if (allTokensToL && !tToken) {
      setToToken(allTokensToL[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensToL]);

  useEffect(() => {
    localStorage.setItem('prevLocation', JSON.stringify(location?.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  async function getCities() {
    // let allCities;
    cities?.map(async (l) => {
      if (l.country === country) {
        setCityData(l.cities);
        setCity(l.cities[0]);
      }
    });
  }

  useEffect(() => {
    if (country) {
      localStorage.setItem('country', JSON.stringify(country));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    if (cityData) {
      localStorage.setItem('cityData', JSON.stringify(cityData));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityData]);

  useEffect(() => {
    if (city) {
      localStorage.setItem('city', JSON.stringify(city));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    if (telegram) {
      localStorage.setItem('telegram', JSON.stringify(telegram));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegram]);

  useEffect(() => {
    if (fToken) {
      localStorage.setItem('fTokenE', JSON.stringify(fToken));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fToken]);

  useEffect(() => {
    if (tToken) {
      localStorage.setItem('tTokenE', JSON.stringify(tToken));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tToken]);

  useEffect(() => {
    if (fValue) {
      localStorage.setItem('fValueE', JSON.stringify(fValue));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fValue]);

  useEffect(() => {
    if (userAddress) {
      localStorage.setItem('userAddress', JSON.stringify(userAddress));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

  useEffect(() => {
    if (paymentMethod) {
      localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  //============================================{Token selection}==============================

  //================================================================================

  useEffect(() => {
    if (paymentMethod === 'cash') {
      setFromValue(2000);
    }
    if (paymentMethod === 'card') {
      setFromValue(150);
    }
  }, [paymentMethod]);

  //====================================================================================

  //====================================================================================================
  //======================================={PRICE BLOCK}================================================
  //====================================================================================================
  // Simulate fetching expected prices
  useEffect(() => {
    fetchPriceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fValue, exchangeRate]);

  useEffect(() => {
    const fetchPrices = async () => {
      fetchExchangeRate();
    };
    // Fetch prices immediately and then every 2 minutes
    fetchExchangeRate();
    const priceInterval = setInterval(fetchPrices, 2 * 60 * 1000);
    // Clear the interval on unmount
    return () => clearInterval(priceInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fToken, tToken]);

  const fetchPriceData = async () => {
    if (loading) {
      return;
    }
    if (
      fValue === 0 ||
      fValue === '0' ||
      fValue === null ||
      fValue === undefined
    ) {
      return;
    }

    if (
      exchangeRate === 0 ||
      exchangeRate === '0' ||
      exchangeRate === null ||
      exchangeRate === undefined
    ) {
      return;
    }

    if (!fToken) {
      return;
    }

    if (!tToken) {
      return;
    }
    const userData = {
      fToken,
      tToken,
      exchangeRate,
      fValue,
      service,
      subService,
    };
    try {
      setLoading(true);

      const response = await getTransactionRateInfo(userData);

      if (response.tValueFormatted) {
        setTransactionRates(response);
        let newRates = response;
        let updatedRate = { ...newRates, exchangeRate: exchangeRate };
        dispatch(getTransactionRate(updatedRate));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    if (loading) {
      return;
    }

    if (!fToken) {
      return;
    }

    if (!tToken) {
      return;
    }
    const userData = { fToken, tToken, service, subService };
    try {
      setLoading(true);

      const response = await getTokenExchangeRate(userData);
      console.log({ exchangeData: response });

      // setExchangeRate(response?.exchangeRate);

      if (response.exchangeRate === 'undefined') {
        // set is loading as true
        //too many requests
        return;
      }
      if (response.exchangeRate) {
        // set is loading as true
        setExchangeRate(response?.exchangeRate);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      // add loading animate to toPrice and exchange rate
      console.log({ loading: 'loading prices please hold' });
    }
  }, [loading]);
  //====={use source data to reset values here e.g booking app approach like in placeForm }==============
  return (
    <>
      {percentageProgress === 1 && (
        <BuyCardScreen1
          percentageProgress={percentageProgress}
          setPercentageProgress={setPercentageProgress}
          fTitle={fTitle}
          tTitle={tTitle}
          fToken={fToken}
          setFromToken={setFromToken}
          tToken={tToken}
          setToToken={setToToken}
          fValue={fValue}
          setFromValue={setFromValue}
          loading={loading}
          mode={mode}
          service={service}
          setService={setService}
          subService={subService}
          setSubService={setSubService}
          setTxInfo={setTxInfo}
          allTokensFrom={allTokensFrom}
          allTokensTo={allTokensTo}
          exchangeRate={exchangeRate}
          transactionRates={transactionRates}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentOptions={paymentOptions}
          cities={cities}
          setCountry={setCountry}
          setCityData={setCityData}
          setCity={setCity}
          country={country}
          cityData={cityData}
          city={city}
          tValue={tValue}
        />
      )}
      {percentageProgress === 2 && (
          <BuyCardScreen2
            percentageProgress={percentageProgress}
            setPercentageProgress={setPercentageProgress}
            fTitle={fTitle}
            tTitle={tTitle}
            fToken={fToken}
            setFromToken={setFromToken}
            tToken={tToken}
            setToToken={setToToken}
            fValue={fValue}
            setFromValue={setFromValue}
            loading={loading}
            mode={mode}
            service={service}
            setService={setService}
            subService={subService}
            setSubService={setSubService}
            setTxInfo={setTxInfo}
            allTokensFrom={allTokensFrom}
            allTokensTo={allTokensTo}
            exchangeRate={exchangeRate}
            transactionRates={transactionRates}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentOptions={paymentOptions}
            cities={cities}
            setCountry={setCountry}
            setCityData={setCityData}
            setCity={setCity}
            country={country}
            cityData={cityData}
            city={city}
            tValue={tValue}
            userAddress={userAddress}
            setUserAddress={setUserAddress}
            telegram={telegram}
            setTelegram={setTelegram}
            //==================================
            provider={provider}
            setProvider={setProvider}
            fullName={fullName}
            setFullName={setFullName}
            bankName={bankName}
            setBankName={setBankName}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            phone={phone}
            setPhone={setPhone}
            providers={providers}
          />
        )}
        {percentageProgress === 3 && (
          <BuyCardScreen3
            percentageProgress={percentageProgress}
            setPercentageProgress={setPercentageProgress}
            fToken={fToken}
            tToken={tToken}
            fValue={fValue}
            userAddress={userAddress}
            fTitle={fTitle}
            tTitle={tTitle}
            service={service}
            subService={subService}
            setTxInfo={setTxInfo}
            country={country}
            city={city}
            //==================================
            provider={provider}
            fullName={fullName}
            bankName={bankName}
            cardNumber={cardNumber}
            phone={phone}
          />
        )}
    </>
  );
};
