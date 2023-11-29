import React, { useState, useEffect } from 'react';
import { Progress } from '../../../components/Progress';
import { Checkout } from '../../../components/Checkout';
import { CheckoutDefi } from '../../../components/CheckoutDefi';
import { Signup } from '../../../components/Signup';
import { Confirm } from '../../../components/Confirm';
import { ConfirmSwap } from '../../../components/ConfirmSwap';
import {
  createTransaction,
  getTransactionByTxId,
  getTransactionByTxIdInternal,
} from '../../../redux/features/transaction/transactionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';

export const DefiScreen3 = (props) => {
  const {
    percentageProgress,
    setPercentageProgress,
    fToken,
    tToken,
    fValue,
    userAddress,
    fTitle,
    tTitle,
    service,
    subService,
    setTxInfo,
    tValue,
    setIsSwapping,
    estimatedGas,
    exchangeRate,
    chain,
    swappingData,
    isValidTransaction,
    setIsSendTransaction,
    isSwapSuccess,
  } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     REDUX STATES    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  const { user } = useSelector((state) => state.user);

  const createTransactionResponse = useSelector(
    (state) => state.transaction?.createTransaction
  );

  const transactionRates = useSelector(
    (state) => state.transaction?.getTransactionRate
  );
  const youSend = transactionRates ? transactionRates?.youSend : 0;
  const youGet = transactionRates ? transactionRates?.youGet : 0;
  const processingFee = transactionRates ? transactionRates?.processingFee : 0;
  const networkFee = transactionRates ? transactionRates?.networkFee : 0;
  const serviceFee = transactionRates ? transactionRates?.serviceFee : 0;
  //===={To be added}========
  // const estimatedGas = transactionRates ? transactionRates?.estimatedGas : 0;
  const amount = transactionRates ? transactionRates?.amount : 0;

  const tx = swappingData ? swappingData?.tx : null;
  const from = tx?.from;
  const to = tx?.to; // OneInch
  const value = tx?.value; // raw fValue
  const gas = tx?.gas;
  const gasPrice = tx?.gasPrice;

  // from: '0x56c8b61db2a5bf5679172901585e76eedb6bc3e6',
  //       to: '0x1111111254eeb25477b68fb85ed929f73a960582',
  //       data: '0x12aa3caf000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd09000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd0900000000000000000000000056c8b61db2a5bf5679172901585e76eedb6bc3e6000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000012f763a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011b0000000000000000000000000000000000000000fd00006e00005400004e802026678dcd00000000000000000000000000000000000000008d8f2afaf11dd22baa54c7102572bef7f17a92e000000000000000000000000000000000000000000000000000005af3107a400000206b4be0b94041c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2d0e30db00c20c02aaa39b223fe8d0a0e5c4f27ead9083c756cc274c99f3f5331676f6aec2756e1f39b4fc029a83e6ae40711b8002dc6c074c99f3f5331676f6aec2756e1f39b4fc029a83e1111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000000000000000012f763ac02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000008b1ccac8',
  //       value: '10000000000000000',
  //       gas: 239290,
  //       gasPrice: '56908705846',
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     LOCAL STATES    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */

  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  /*********************************************     REACT STATES    **************************************************** */
  /********************************************************************************************************************** */
  /********************************************************************************************************************** */
  const [isCheckout, setIsCheckout] = useState(false);
  const [isConfirm, setIsConfirm] = useState(true);
  const [isSend, setIsSend] = useState(false);

  useEffect(() => {
    if (createTransactionResponse) {
      setTxInfo(createTransactionResponse);
      let txData = createTransactionResponse;
      dispatch(getTransactionByTxId(txData?._id)); // fetch updated transaction every minute
      dispatch(getTransactionByTxIdInternal(createTransactionResponse));
      // navigate(`defi/${txData?._id}`); // proceed to stage 3 // Navigate to Completion (step 5 and status: Completed) and display swap information
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createTransactionResponse]);

  //========={if the swap is sucessful, store swap information in the database for user's history}
  useEffect(() => {
    if (isSwapSuccess) {
      submitTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapSuccess]);

  //===={update transaction data}============
  const submitTransaction = async () => {
    if (Number(fValue) < 0) {
      return toast.error('One or more required fields are empty');
    }

    // const userData = {
    //   //===========================
    //   userId: user?._id ? user?._id : user?.userId,
    //   fToken,
    //   tToken,
    //   fValue,
    //   userAddress,
    //   service,
    //   subService, // new to be added to frontend
    //   percentageProgress: 3,
    //   //======{new}==========
    //   youSend,
    //   youGet,
    //   serviceFee,
    //   networkFee,
    //   processingFee,
    //   exchangeRate,
    //   tValue,
    //   amount,
    // };

    const userData = {
      //===========================
      userId: user?._id ? user?._id : user?.userId,
      fToken,
      tToken,
      fValue,
      userAddress,
      service,
      subService, // new to be added to frontend
      percentageProgress: 3,
      //======{new}==========
      youSend,
      youGet,
      serviceFee,
      networkFee,
      processingFee,
      exchangeRate,
      tValue,
      amount,
      hash: swappingData?.hash || '',
      tx: swappingData?.tx, // transaction data
    };

    dispatch(createTransaction(userData));
  };

  // tx: {
  //   from: '0x56c8b61db2a5bf5679172901585e76eedb6bc3e6',
  //   to: '0x1111111254eeb25477b68fb85ed929f73a960582',
  //   data: '0x12aa3caf000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd09000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd0900000000000000000000000056c8b61db2a5bf5679172901585e76eedb6bc3e6000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000012f763a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011b0000000000000000000000000000000000000000fd00006e00005400004e802026678dcd00000000000000000000000000000000000000008d8f2afaf11dd22baa54c7102572bef7f17a92e000000000000000000000000000000000000000000000000000005af3107a400000206b4be0b94041c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2d0e30db00c20c02aaa39b223fe8d0a0e5c4f27ead9083c756cc274c99f3f5331676f6aec2756e1f39b4fc029a83e6ae40711b8002dc6c074c99f3f5331676f6aec2756e1f39b4fc029a83e1111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000000000000000012f763ac02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000008b1ccac8',
  //   value: '10000000000000000',
  //   gas: 239290,
  //   gasPrice: '56908705846',
  // }
  useEffect(() => {
    if (isSend && user?.token) {
      submitTransaction();
      setIsSend(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSend]);
  // consider dienabling if transaction wouldn't be saved on DB
  if (isSend && !user?.token) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="flex flex-col xl:flex-row justify-center">
      <div className="flex flex-col xl:flex-row gap-[32px] mt-[8px]">
        <div className="flex-col xl:flex-row h-[500px]">
          <Progress percentageProgress={percentageProgress} />
        </div>
        {isCheckout && (
          <>
            <div className="flex flex-col justify-start items-start xl:justify-center xl:items-center mt-6 xl:mt-0 gap-4">
              <CheckoutDefi
                setPercentageProgress={setPercentageProgress}
                fTitle={fTitle}
                tTitle={tTitle}
                estimatedGas={estimatedGas}
                chain={chain}
                swappingData={swappingData}
                fToken={fToken}
                tToken={tToken}
                fValue={fValue}
                tValue={tValue}
                exchangeRate={exchangeRate}
              />
              <Signup
                setIsCheckout={setIsCheckout}
                setIsConfirm={setIsConfirm}
              />
            </div>
          </>
        )}
        {isConfirm && (
          <>
            <div className="flex flex-col justify-start items-start xl:justify-center xl:items-center mt-6 xl:mt-0 gap-4">
              <CheckoutDefi
                setPercentageProgress={setPercentageProgress}
                fTitle={fTitle}
                tTitle={tTitle}
                estimatedGas={estimatedGas}
                chain={chain}
                swappingData={swappingData}
                fToken={fToken}
                tToken={tToken}
                fValue={fValue}
                tValue={tValue}
                exchangeRate={exchangeRate}

              />
              <ConfirmSwap
                submitTransaction={setIsSwapping}
                isValidTransaction={isValidTransaction}
                setIsSendTransaction={setIsSendTransaction}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
