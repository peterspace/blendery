import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useConnect,
  useAccount,
  useSwitchNetwork,
  useSigner,
  useBalance,
} from 'wagmi';
import erc20ABI from './engine/erc20.json';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useQuery } from 'react-query';

import { DefiScreen1 } from './DefiScreen1';
import { DefiScreen2 } from './DefiScreen2';
import { DefiScreen3 } from './DefiScreen3';
import { DefiScreen4 } from './DefiScreen4';

import { useDispatch, useSelector } from 'react-redux';
import { getTransactionRate } from '../../../redux/features/transaction/transactionSlice';

import {
  getTokenExchangeRate,
  getTransactionRateInfo,
} from '../../../services/apiService';
import {
  getTokenExchangeRateSwap,
  getTransactionRateSwap,
  getSpender,
  getTokensDefiById,
  getChainPrice,
  updateChain,
  updateConnectedNetwork,
  updateSlippage,
  updateIsChangeChainId,
  updateConnecting,
} from '../../../redux/features/swap/swapSlice';

import {
  getTransactionSwapRateService,
  getTokenExchangeRateSwapService,
  getSpenderService,
  swapService,
  getSwapApprovalService,
} from '../../../services/apiService';
import { networksOptions } from '../../../constants';
import { getTokensDefiByIdService } from '../../../services/apiService';

//w-[370px] ===w-[300px]
//w-[375px] === w-[320px] xs:w-[340px]

export const DefiHome = (props) => {
  const {
    mode,
    user,
    service,
    subService,
    txInfo,
    setTxInfo,
    setService,
    setSubService,
    //========={new}=======================
    isToLoading,
    setIsToLoading,
    isFromLoading,
    setIsFromLoading,
    setPercentageProgressHome,
  } = props;
  const location = useLocation();
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************    WAGMI BLOCK    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  const {
    connect,
    connectors,
    error: isErrorConnector,
    isLoading: isLoadingConnector,
    pendingConnector,
  } = useConnect();

  const signer = useSigner();
  const { switchNetwork } = useSwitchNetwork();

  const { address, isConnected } = useAccount();
  const walletAddress = address;
  console.log({ walletAddress: walletAddress });
  const [activeConnection, setActiveConnection] = useState(
    connectors && connectors[0]
  );

  console.log({ activeConnection: activeConnection });
  //====================================================================================================
  //======================================={BALANCES}=====================================
  //====================================================================================================

  const chainL = localStorage.getItem('chainDefi')
    ? JSON.parse(localStorage.getItem('chainDefi'))
    : networksOptions[0];

  // const chain = useSelector((state) => state.swap?.chain) || networksOptions[0];
  const chain = useSelector((state) => state.swap?.chain);

  // const [chain, setChain] = useState(chainL);
  // const [chain, setChain] = useState();
  const chainId = chain?.chainId;
  console.log({ chainIdApp: chainId });

  const { data: dataBal } = useBalance({
    address,
    // chainId: chainId,
    chainId: Number(chainId), // requires type "Number"

    watch: true,
  });

  const [balance, setBalance] = useState('');
  const [fromBalance, setFromBalance] = useState(0.0);
  const [fromBalancePercent, setFromBalancePercent] = useState(75);
  const fromBalanceTest = 1.25; // to check if percentage values for fromvalue works
  const [toBalance, setToBalance] = useState(0.0);

  //====================================================================================================
  //======================================={pPice Deviation}=====================================
  //====================================================================================================

  const [priceDeviation, setPriceDeviation] = useState(0.0);
  const [isPriceDeviation, setIsPriceDeviation] = useState(true);
  const [isCriticalPriceDeviation, setIsCriticalPriceDeviation] =
    useState(true);
  //==================================================================
  //==================================================================
  //The type of service initiated will determine the api calls made and used by the estimator for calling token list and prices
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     REDUX STATES    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  const dispatch = useDispatch();
  const allTokensFromL = useSelector((state) => state.token?.tokensDefiById);
  const allTokensToL = useSelector((state) => state.token?.tokensDefiById);

  const [allTokensFrom, setAllTokensFrom] = useState(allTokensFromL || null);
  const [allTokensTo, setAllTokensTo] = useState(allTokensToL || null);
  //======================={RATES and PRICES}========================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const exchangeRateInfo = useSelector(
    (state) => state.swap?.getTokenExchangeRateSwap
  );
  const exchangeRate = exchangeRateInfo?.exchangeRate || 0;
  const fromPrice = exchangeRateInfo?.fUSDPrice || 0;
  const toPrice = exchangeRateInfo?.tUSDPrice || 0;
  const transactionRates = useSelector(
    (state) => state.swap?.getTransactionRateSwap
  );
  const tValue = transactionRates ? transactionRates?.tValueFormatted : 0;
  console.log({ exchangeRateInfo: exchangeRateInfo });
  console.log({ transactionRates: transactionRates });

  // console.log({ transactionRatesLoading: transactionRatesLoading });

  //======================={RATES and PRICES}========================================================

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     SWAP PARAMS    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  const percentageProgressL = localStorage.getItem('percentageProgressDefi')
    ? JSON.parse(localStorage.getItem('percentageProgressDefi'))
    : 1;

  const [percentageProgress, setPercentageProgress] =
    useState(percentageProgressL);

  const fTokenL = localStorage.getItem('fTokenDefi')
    ? JSON.parse(localStorage.getItem('fTokenDefi'))
    : null;

  const [fToken, setFromToken] = useState(fTokenL);
  const tTokenL = localStorage.getItem('tTokenDefi')
    ? JSON.parse(localStorage.getItem('tTokenDefi'))
    : null;
  const [tToken, setToToken] = useState(tTokenL);
  const fValueL = localStorage.getItem('fValueDefi')
    ? JSON.parse(localStorage.getItem('fValueDefi'))
    : 1;
  const [fValue, setFromValue] = useState(fValueL);

  const slippageL = localStorage.getItem('slippageDefi')
    ? JSON.parse(localStorage.getItem('slippageDefi'))
    : '1';

  const [slippage, setSlippage] = useState(slippageL);

  const swappingDataL = localStorage.getItem('swappingDataDefi')
    ? JSON.parse(localStorage.getItem('swappingDataDefi'))
    : null;
  const [swappingData, setSwappingData] = useState(swappingDataL);
  console.log({ swappingData: swappingData });
  const [estimatedGas, setEstimatedGas] = useState(0.0);

  const isValidTransactionL = localStorage.getItem('isValidTransactionDefi')
    ? JSON.parse(localStorage.getItem('isValidTransactionDefi'))
    : false;
  const [isValidTransaction, setIsValidTransaction] =
    useState(isValidTransactionL);

  const isSendTransactionL = localStorage.getItem('isSendTransactionDefi')
    ? JSON.parse(localStorage.getItem('isSendTransactionDefi'))
    : false;
  const [isSendTransaction, setIsSendTransaction] =
    useState(isSendTransactionL);

  const isSwapSuccessL = localStorage.getItem('isSwapSuccessDefi')
    ? JSON.parse(localStorage.getItem('isSwapSuccessDefi'))
    : false;
  const [isSwapSuccess, setIsSwapSuccess] = useState(isSwapSuccessL);
  const isChainChange = localStorage.getItem('chainSwitch')
    ? JSON.parse(localStorage.getItem('chainSwitch'))
    : false;

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************    CONDITIONALS    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSucess] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // approval granted
  const [isTxValue, setIsTxValue] = useState(false);
  const [isCaution, setIsCaution] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [info, setInfo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isLowSlippage, setIsLowSlippage] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('');
  const [isSlippageChange, setIsSlippageChange] = useState(false);
  const [isSlippageAuto, setIsSlippageAuto] = useState(true); // default state is

  const [isSwapError, setIsSwapError] = useState(false);
  const [isApproveSuccess, setIsApproveSuccess] = useState(false);
  const [isApproveError, setIsApproveError] = useState(false);
  const [isSwap, setIsSwap] = useState(false);
  //================{PAGES}==================

  const connectedNetworkSwitchL = useSelector(
    (state) => state.swap?.connectedNetwork
  );
  const [isChainModalVisible, setIsChainModalVisible] = useState(
    connectedNetworkSwitchL
  );
  const [isFromTokenPage, setIsFromTokenPage] = useState(false);
  const [isToTokenPage, setIsToTokenPage] = useState(false);
  const [isSlippagePage, setIsSlippagePage] = useState(false);

  const [validationOwner, setValidationOwner] = useState(false);
  console.log({ validationOwner: validationOwner });

  const isSwappingL = localStorage.getItem('isSwapping')
    ? JSON.parse(localStorage.getItem('isSwapping'))
    : false;
  const [isSwapping, setIsSwapping] = useState(isSwappingL); // approval granted

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     LOCAL STATES    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  const [fTitle, setFTitle] = useState('You send');
  const [tTitle, setTTitle] = useState('You get');

  const userAddressL = localStorage.getItem('userAddress')
    ? JSON.parse(localStorage.getItem('userAddress'))
    : null;

  const [userAddress, setUserAddress] = useState(userAddressL);
  const [spender, setSpender] = useState();

  //==================={All Tokens List}===========================

  useEffect(() => {
    if (chain) {
      localStorage.setItem('chainDefi', JSON.stringify(chain));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  //========{API CALLS}=========================
  useEffect(() => {
    if (!chain && chainL) {
      // setChain(chainL);
      dispatch(updateChain(chainL));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  useEffect(() => {
    if (allTokensFromL) {
      setAllTokensFrom(allTokensFromL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensFromL]);

  useEffect(() => {
    if (allTokensToL) {
      setAllTokensTo(allTokensToL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensToL]);
  //==================={Default Selected Tokens }===========================

  useEffect(() => {
    if (percentageProgress) {
      localStorage.setItem(
        'percentageProgressDefi',
        JSON.stringify(percentageProgress)
      );
      setPercentageProgressHome(percentageProgress);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentageProgress]);

  useEffect(() => {
    if (allTokensFromL && !fToken) {
      setFromToken(allTokensFromL[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensFromL]);

  useEffect(() => {
    if (allTokensToL && !tToken) {
      setToToken(allTokensToL[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensToL]);

  //==================={Default Selected Tokens }===========================

  useEffect(() => {
    if (allTokensFromL && !fToken) {
      setFromToken(allTokensFromL[0]);
    }

    if (allTokensFromL && isChainChange === true && chainId !== null) {
      setFromToken(allTokensFromL[0]);
      localStorage.setItem('chainSwitch', JSON.stringify(false));
      localStorage.setItem('chainId', JSON.stringify(chainId));
      networksOptions?.map(async (b) => {
        if (b.id === chainId) {
          localStorage.setItem('chain', JSON.stringify(b));
          dispatch(updateChain(b));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensFromL, isChainChange]);

  useEffect(() => {
    if (allTokensToL && !tToken) {
      setToToken(allTokensToL[1]);
    }

    if (allTokensToL && isChainChange === true && chainId !== null) {
      setToToken(allTokensToL[1]);
      localStorage.setItem('chainSwitch', JSON.stringify(false));
      localStorage.setItem('chainId', JSON.stringify(chainId));
      networksOptions?.map(async (b) => {
        if (b.id === chainId) {
          localStorage.setItem('chain', JSON.stringify(b));
          dispatch(updateChain(b));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokensToL, isChainChange]);

  useEffect(() => {
    localStorage.setItem('prevLocation', JSON.stringify(location?.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //======================================================================================================

  useEffect(() => {
    if (fToken) {
      localStorage.setItem('fTokenDefi', JSON.stringify(fToken));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fToken]);

  useEffect(() => {
    if (tToken) {
      localStorage.setItem('tTokenDefi', JSON.stringify(tToken));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tToken]);

  useEffect(() => {
    if (slippage) {
      localStorage.setItem('slippageDefi', JSON.stringify(slippage));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slippage]);

  useEffect(() => {
    if (fValue) {
      localStorage.setItem('fValueDefi', JSON.stringify(fValue));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fValue]);

  useEffect(() => {
    if (userAddress) {
      localStorage.setItem('userAddress', JSON.stringify(userAddress));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress]);

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
      exchangeRate,
      fValue,
    };
    try {
      setLoading(true);

      const response = await getTransactionSwapRateService(userData);

      if (response.tValueFormatted) {
        // setTransactionRates(response);
        let newRates = response;
        let updatedRate = {
          ...newRates,
          exchangeRate: exchangeRate,
          fromPrice: fromPrice,
          toPrice: toPrice,
        };
        dispatch(getTransactionRateSwap(updatedRate));
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
    // const userData = { fToken, tToken, service: 'defi', subService: 'defi' };
    const userData = {
      fToken,
      chainId,
      tToken,
    };

    try {
      setLoading(true);

      const response = await getTokenExchangeRateSwapService(userData);
      console.log({ exchangeData: response });
      if (response.exchangeRate === 'undefined') {
        return;
      }
      if (response.exchangeRate) {
        dispatch(getTokenExchangeRateSwap(response));
        //
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

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************    NEW SWAP BLOCK    *************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  //====================================================================================================
  //======================================={CHAIN BALANCE}=====================================
  //====================================================================================================

  useEffect(() => {
    getChainBalance();

    if (isNaN(balance)) {
      // return NaN;
      getChainBalance();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, balance, isConnected]);

  async function getChainBalance() {
    if (isConnected) {
      const tokenbal = Number(dataBal?.formatted).toFixed(3);
      setBalance(tokenbal);
      localStorage.setItem('chainBalance', JSON.stringify(tokenbal));
    }
  }

  //======================================={PRCICE DEVIATION}=====================================
  //====================================================================================================

  useEffect(() => {
    if (tValue !== 0) {
      getPriceDeviation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tValue, fromPrice, toPrice]);

  async function getPriceDeviation() {
    let fromValueTotalL = Number(fValue) * Number(fromPrice);
    let toValueTotalL = Number(tValue) * Number(toPrice);
    if (fromValueTotalL > toValueTotalL) {
      let priceDifference = fromValueTotalL - toValueTotalL;
      let priceSum = toValueTotalL + fromValueTotalL;
      let priceAverage = priceSum / 2;
      let percentageDeviationRaw = 100 * (priceDifference / priceAverage);
      let percentageDeviation = percentageDeviationRaw.toFixed(2);

      setPriceDeviation(percentageDeviation);
      setIsPriceDeviation(true);

      if (Number(percentageDeviationRaw) > 12) {
        setIsCriticalPriceDeviation(true);
      }
    } else {
      setIsPriceDeviation(false);
    }
  }

  //====================================================================================================
  //======================================={SLIPPAGE}=====================================
  //====================================================================================================

  useEffect(() => {
    let slippageValue = Number(slippage);
    if (slippage !== null && slippageValue > 0 && slippageValue < 0.09) {
      setIsLowSlippage(true);
    }

    if (slippageValue > 3) {
      setIsWarning(true);
    }

    if (slippage !== null && slippageValue > 0.09 && slippageValue <= 3) {
      setIsLowSlippage(false);
      setIsWarning(false);
    }

    if (slippage === null || undefined) {
      setIsLowSlippage(false);
      setIsWarning(false);
    }
    if (slippage === '') {
      setIsLowSlippage(false);
      setIsWarning(false);
    }
  }, [slippage, isWarning, isLowSlippage]);

  //===================================================================================================

  useEffect(() => {
    if (isProcessing === true) {
      setTimeout(() => {
        setIsProcessing(false);
      }, 10000); // reduce time
    }
  });
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************    SWAP BLOCK      **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  /*

  
 ====================================================================
                           Validate swap
 ====================================================================
*/

  useEffect(() => {
    localStorage.setItem('isSwapping', JSON.stringify(isSwapping));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapping]);

  useEffect(() => {
    if (swappingData) {
      localStorage.setItem('swappingDataDefi', JSON.stringify(swappingData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swappingData]);

  useEffect(() => {
    localStorage.setItem(
      'isValidTransactionDefi',
      JSON.stringify(isValidTransaction)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidTransaction]);

  useEffect(() => {
    if (isSwapSuccess) {
      localStorage.setItem('isSwapSuccessDefi', JSON.stringify(isSwapSuccess));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapSuccess]);

  useEffect(() => {
    if (isSwapSuccess || isSwapError || isApproveSuccess || isApproveError) {
      setPercentageProgress(4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapSuccess, isSwapError, isApproveSuccess, isApproveError]);

  useEffect(() => {
    setTimeout(() => {
      validateSwapOwner();
      if (validationOwner === true) {
        setInfo('');
        setIsCaution(false);
      }
    }, 1000);
  });

  async function validateSwapOwner() {
    setValidationOwner(false);

    if (!walletAddress) {
      setInfo('Wallet not connected');
      setIsCaution(true);

      setValidationOwner(false);
    } else if (!fValue) {
      setInfo('Please enter amount');
      setIsCaution(true);

      setValidationOwner(false);
      // } else if (balance <= 0) {
      //   setInfo(`Insufficient network balance`);
      //   setIsCaution(true);

      //   setValidationOwner(false);
      // } else if (fromBalance <= fValue) {
      //   setInfo('Insufficient balance');
      //   setIsCaution(true);

      //   setValidationOwner(false);
    } else {
      setValidationOwner(true);
    }
  }

  /*
 ====================================================================
                           Main Swap Call for step 3
 ====================================================================

*/
  //========={Step 1: Generate swap Data }=================
  useEffect(() => {
    if (isSwapping) {
      swapToken();
      setIsSwapping(false); // after thr process is completed
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapping]);

  //========={Step 2: swap only if the user has sufficient balance and there is liquidity for the token pair }=================

  useEffect(() => {
    if (isValidTransaction && isSendTransaction) {
      swapOwner();
      setIsValidTransaction(false); // after thr process is completed
      setIsSendTransaction(false); // after thr process is completed
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidTransaction, isSendTransaction]);

  async function swapToken() {
    if (
      fToken?.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ||
      fToken?.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      setIsSwap(true);
      await fetchSwapData();
    } else {
      setIsApprove(true);
      await approve();
    }
  }

  // send for approval from backend
  async function approve() {
    setIsProcessing(true);
    setIsLoading(true);
    const userData = { chainId, fToken, fValue };
    try {
      const response = await getSwapApprovalService(userData);
      if (response.approveData) {
        let tx = response?.approveData;

        let wallet = signer.data;
        setIsSent(true);
        const approval = await wallet.sendTransaction(tx);
        console.log({ approvalReward: approval });

        let approvalStatus = await approval.wait();

        if (approvalStatus?.status) {
          // if (approvalStatus?.status === 1) {
          setIsSucess(true);
          setIsApproved(true);
          setIsApproveSuccess(true);
          console.log({ approvalData: approvalStatus });
          console.log({
            txHash:
              (approvalStatus?.hash && approvalStatus?.hash) ||
              (approvalStatus?.transactionHash &&
                approvalStatus?.transactionHash) ||
              '',
          });
          setTimeout(() => {
            setIsSwap(false);
          }, 2000);
          setTimeout(async () => {
            // await swapOwner();
            await fetchSwapData(); // updated
          }, 2000);
        }
      }
    } catch (error) {
      console.log(error);
      setIsError(true); // original
      setIsApproveError(true);
      // For testing purpose
      // if (error?.message) {
      //   setTimeout(async()=>{
      //     await swapOwner();
      //   }, 2000)
      //   setIsApproved(false);
      // }

      // For testing purpose
      // if (error?.message) {
      //   setTimeout(async()=>{
      //     setIsChainModalVisible(true)
      //   }, 2000)
      // }
      setTimeout(() => {
        setIsApproved(false);
      }, 20000);
      console.log({ ApproveError: error?.message });
      // return error?.message;
    }
  }

  useEffect(() => {
    if (isApprove === false && isSwap === false) {
      resetStatus();
    }
  }, [isApprove, isSwap]);

  async function resetStatus() {
    setIsLoading(false);
    setIsError(false);
    setIsSucess(false);
    setIsSent(false);
    setIsApprove(false);
    setIsApproved(false);
  }

  //====================================================

  async function fetchSwapData() {
    if (validationOwner === true) {
      setIsProcessing(true);
      setIsLoading(true);
      //const { chainId, fToken, tToken, walletAddress, slippage, fValue }
      const userData = {
        chainId,
        fToken,
        tToken,
        walletAddress,
        slippage,
        fValue,
      };
      try {
        const response = await swapService(userData);
        if (response.swapData) {
          setSwappingData(response.swapData);
          setIsValidTransaction(true); // the user has sufficient balance and can proceed with the swap with the generated data
        }
      } catch (error) {
        console.log(error);
        setIsError(true);
        setIsSwapError(true);
        console.log({ SwapError: error?.message });
        // return error?.message;
        setTimeout(() => {
          setIsSwap(false);
        }, 20000);
      }
    }
  }

  async function swapOwner() {
    if (validationOwner === true) {
      setIsProcessing(true);
      setIsLoading(true);
      //const { chainId, fToken, tToken, walletAddress, slippage, fValue }
      const userData = {
        chainId,
        fToken,
        tToken,
        walletAddress,
        slippage,
        fValue,
      };
      try {
        const response = await swapService(userData);

        if (response.swapData) {
          setSwappingData(response.swapData);
          let tx = {
            data: response?.swapData?.tx.data,
            from: response?.swapData?.tx.from,
            gasLimit: estimatedGas,
            // gasLimit: response?.swapData?.tx.gas,
            gasPrice: response?.swapData?.tx.gasPrice,
            to: response?.swapData?.tx.to,
            value: response?.swapData?.tx.value,
          };

          let wallet = signer.data;
          setIsSent(true);

          const transaction = await wallet.sendTransaction(tx);

          console.log({ swapReward: transaction });

          let txStatus = await transaction.wait();

          if (txStatus?.status) {
            // if (txStatus?.status === 1) {
            setIsSucess(true);
            setIsSwapSuccess(true);
            console.log({ txData: txStatus });
            console.log({
              txHash:
                (txStatus?.hash && txStatus?.hash) ||
                (txStatus?.transactionHash && txStatus?.transactionHash) ||
                '',
            });

            const txHash =
              (txStatus?.hash && txStatus?.hash) ||
              (txStatus?.transactionHash && txStatus?.transactionHash) ||
              '';

            let updatedSwappingData = {
              ...swappingData,
              hash: txHash,
            };
            setSwappingData(updatedSwappingData); // add txHash to swapping Data

            console.log({ txStatus: 'Successful' });
            setTimeout(() => {
              setIsSwap(false);
            }, 20000);
          }
        }
      } catch (error) {
        console.log(error);
        setIsError(true);
        setIsSwapError(true);
        console.log({ SwapError: error?.message });
        // return error?.message;
        setTimeout(() => {
          setIsSwap(false);
        }, 20000);
      }
    }
  }

  //=====================================================================================
  //======={ To be tested for switching inpute values}=========

  //================={updateProtocols}===============

  //=========================={TOKEN BALANCES}=================================
  //=========================={TOKEN BALANCES}=================================

  // useEffect(() => {
  //   if (isNaN(fromBalance)) {
  //     // return NaN;
  //     setTimeout(() => {
  //       fTokenBalance();
  //     }, 200);
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fromBalance]);

  useEffect(() => {
    if (fromBalance === 'NaN') {
      // return NaN;
      setTimeout(() => {
        fTokenBalance();
      }, 200);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromBalance]);

  useEffect(() => {
    if (isConnected) {
      setFromBalance(0.0);
      fTokenBalance();
      // setTimeout(() => {
      //   fTokenBalance();
      // }, 2000); // production 2000
    }

    if (isConnected === true && isChainChange === true) {
      // setFromBalance(0.0);
      setTimeout(() => {
        fTokenBalance();
      }, 2000); // production 2000
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, fToken, fromBalance, balance]);

  async function fTokenBalance() {
    let tokenAddress = fToken?.address;
    if (tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      // setFromBalance(balance);
      setFromBalance(Number(balance));
    } else {
      const ERC20Contract = new ethers.Contract(
        tokenAddress,
        erc20ABI,
        signer.data
      );
      const tokenbal = await ERC20Contract.balanceOf(walletAddress);
      const balanceRaw = formatUnits(tokenbal, fToken?.decimals);
      if (Number(balanceRaw) > 0) {
        const formattedBalance = Number(balanceRaw).toFixed(5);
        setFromBalance(formattedBalance);
      }
    }
  }

  useEffect(() => {
    if (isNaN(toBalance)) {
      // return NaN;
      setTimeout(() => {
        tTokenBalance();
      }, 200);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toBalance]);

  useEffect(() => {
    if (isConnected) {
      setToBalance(0.0);
      tTokenBalance();
    }

    if (isConnected === true && isChainChange === true) {
      // setToBalance(0.0);
      setTimeout(() => {
        tTokenBalance();
      }, 2000); // production 2000
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, tToken, toBalance, balance]);

  async function tTokenBalance() {
    let tokenAddress = tToken?.address;
    if (tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      // setToBalance(balance);
      setToBalance(Number(balance));
    } else {
      const ERC20Contract = new ethers.Contract(
        tokenAddress,
        erc20ABI,
        signer.data
      );
      const tokenbal = await ERC20Contract.balanceOf(walletAddress);
      const balanceRaw = formatUnits(tokenbal, tToken?.decimals);
      if (Number(balanceRaw) > 0) {
        const formattedBalance = Number(balanceRaw).toFixed(5);
        setToBalance(formattedBalance);
      }
    }
  }

  //======================================={USD Value Converter}===============================================
  //======================================={USD Value Converter}===============================================

  //========{API CALLS}=========================
  useEffect(() => {
    UpdateSpender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spender, chain]);

  async function UpdateSpender() {
    const userData = {
      chainId: chainId ? chainId : '1',
    };
    const response = await getSpenderService(userData);
    if (response) {
      const { spenderData } = response;
      setSpender(spenderData);
      dispatch(getSpender(response));
    }
  }

  //=============={BACKEND CALLS}==========================

  //======================================={TRANSACTION ERRORS/SUCCESS PROMPTS}============================================
  //======================================={TRANSACTION ERRORS/SUCCESS PROMPTS}============================================

  useEffect(() => {
    if (isSwapSuccess) {
      setTimeout(() => {
        setIsSwapSuccess(false);
      }, 5000);
    }
    if (isSwapError) {
      setTimeout(() => {
        setIsSwapError(false);
      }, 5000);
    }
    if (isApproveSuccess) {
      setTimeout(() => {
        setIsApproveSuccess(false);
      }, 5000);
    }
    if (isApproveError) {
      setTimeout(() => {
        setIsApproveError(false);
      }, 5000);
    }
  }, [isSwapSuccess, isSwapError, isApproveSuccess, isApproveError]);

  async function getConnectedChain() {
    const response = await getTokensDefiByIdService(chainId);
    if (response) {
      dispatch(getTokensDefiById(response));
    }

    // window.location.reload(); // reconsider removing
  }

  useEffect(() => {
    getConnectedChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   getConnectedChain();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [chain]);

  //=====================================================================================

  return (
    <>
      {percentageProgress === 1 && (
        <DefiScreen1
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
          chain={chain}
          // setChain={setChain}
          chainId={chainId}
          tValue={tValue}
        />
      )}
      {percentageProgress === 2 && (
        <DefiScreen2
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
          userAddress={userAddress}
          setUserAddress={setUserAddress}
          chain={chain}
          // setChain={setChain}
          chainId={chainId}
          //============={New}=================
          tValue={tValue}
          isFromLoading={isFromLoading}
          fromBalance={fromBalance}
          fromPrice={fromPrice}
          isToLoading={isToLoading}
          toBalance={toBalance}
          priceDeviation={priceDeviation}
          fromBalancePercent={fromBalancePercent}
          //======================{modals control}===================================
          isConnected={isConnected}
          isFromTokenPage={isFromTokenPage}
          isToTokenPage={isToTokenPage}
          isSlippagePage={isSlippagePage}
        />
      )}
      {percentageProgress === 3 && (
        <DefiScreen3
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
          tValue={tValue}
          setIsSwapping={setIsSwapping}
          estimatedGas={estimatedGas}
          exchangeRate={exchangeRate}
          chain={chain}
          swappingData={swappingData}
          isValidTransaction={isValidTransaction}
          setIsSendTransaction={setIsSendTransaction}
          isSwapSuccess={isSwapSuccess}
        />
      )}
      {percentageProgress === 4 && (
        <DefiScreen4
          percentageProgress={percentageProgress}
          setPercentageProgress={setPercentageProgress}
          isConnected={isConnected}
          setIsSwapSuccess={setIsSwapSuccess}
          isSwapSuccess={isSwapSuccess}
          isSwapError={isSwapError}
          isApproveSuccess={isApproveSuccess}
          isApproveError={isApproveError}
          setIsSwapError={setIsSwapError}
          setIsApproveSuccess={setIsApproveSuccess}
          setIsApproveError={setIsApproveError}
        />
      )}
    </>
  );
};
