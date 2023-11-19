import React, { useEffect, useState } from 'react';
import { Progress } from '../../components/Progress';
import { DetailsCard } from '../../components/DetailsCard';
import { SendFundCardBuy } from '../../components/SendFundCardBuy';

export const Exchange3of4 = (props) => {
  const { percentageProgress, fTitle, tTitle, txData } = props;

  return (
    <div className="flex flex-col xl:flex-row justify-center">
      <>
        {txData ? (
          <div className="flex flex-col xl:flex-row gap-[32px] mt-[8px]">
            <div className="flex-col xl:flex-row h-[500px]">
              <Progress
                percentageProgress={
                  txData?.percentageProgress
                    ? txData?.percentageProgress
                    : percentageProgress
                }
              />
            </div>
            <div className="flex flex-col justify-start items-start xl:justify-center xl:items-center mt-6 xl:mt-0 gap-4">
              <SendFundCardBuy txData={txData} />
            </div>

            <div className="flex-col xl:flex-row h-[374px]">
              <DetailsCard fTitle={fTitle} tTitle={tTitle} txData={txData} />
            </div>
          </div>
        ) : null}
      </>
    </div>
  );
};
