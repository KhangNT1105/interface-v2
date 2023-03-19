import React, { useEffect, useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { CurrencyLogo, CopyHelper } from 'components';
import {
  useBlockNumber,
  useEthPrice,
  useMaticPrice,
  useTokenDetails,
} from 'state/application/hooks';
import {
  shortenAddress,
  formatCompact,
  getIntervalTokenData,
  formatNumber,
  getTokenInfoSwapDetails,
} from 'utils';
import { LineChart } from 'components';
import { Token } from '@uniswap/sdk';
import dayjs from 'dayjs';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTranslation } from 'react-i18next';
import { getIntervalTokenDataV3 } from 'utils/v3-graph';

const SwapTokenDetails: React.FC<{
  token: Token;
}> = ({ token }) => {
  const { t } = useTranslation();
  const currency = unwrappedToken(token);
  const tokenAddress = token.address;
  const { palette } = useTheme();
  const latestBlock = useBlockNumber();
  const { tokenDetails, updateTokenDetails } = useTokenDetails();
  const [tokenData, setTokenData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const prices = priceData ? priceData.map((price: any) => price.close) : [];
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  useEffect(() => {
    (async () => {
      const tokenDetail = tokenDetails.find(
        (item) => item.address === tokenAddress,
      );
      setTokenData(tokenDetail?.tokenData);
      setPriceData(tokenDetail?.priceData);
      const currentTime = dayjs.utc();
      const startTime = currentTime
        .subtract(1, 'day')
        .startOf('hour')
        .unix();
      const tokenPriceDataV2 = await getIntervalTokenData(
        tokenAddress,
        startTime,
        3600,
        latestBlock,
      );
      const tokenPriceDataV3 = await getIntervalTokenDataV3(
        tokenAddress.toLowerCase(),
        startTime,
        3600,
        latestBlock,
      );
      const tokenPriceIsV2 = !!tokenPriceDataV2.find(
        (item) => item.open && item.close,
      );
      const tokenPriceData = tokenPriceIsV2
        ? tokenPriceDataV2
        : tokenPriceDataV3;
      setPriceData(tokenPriceData);

      if (
        ethPrice.price &&
        ethPrice.oneDayPrice &&
        maticPrice.price &&
        maticPrice.oneDayPrice
      ) {
        const tokenInfo = await getTokenInfoSwapDetails(
          ethPrice.price,
          ethPrice.oneDayPrice,
          maticPrice.price,
          maticPrice.oneDayPrice,
          tokenAddress,
        );
        setTokenData(tokenInfo);
        updateTokenDetails({
          address: tokenAddress,
          tokenData: tokenInfo,
          priceData: tokenPriceData,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tokenAddress,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
  ]);

  return (
    <Box>
      <Box className='flex items-center justify-between' px={2} py={1.5}>
        <Box className='flex items-center'>
          <CurrencyLogo currency={currency} size='28px' />
          <Box ml={1}>
            <small>{currency.symbol}</small>
            {tokenData ? (
              <Box className='flex items-center'>
                <small>${formatNumber(tokenData.priceUSD)}</small>
                <Box
                  ml={0.5}
                  className={`flex items-center ${
                    priceUp ? 'text-success' : 'text-error'
                  }`}
                >
                  {priceUp ? <ArrowDropUp /> : <ArrowDropDown />}
                  <small>{priceUpPercent}%</small>
                </Box>
              </Box>
            ) : (
              <Skeleton variant='rect' width={100} height={20} />
            )}
          </Box>
        </Box>
        {tokenData && priceData ? (
          <Box width={88} height={47} position='relative'>
            <Box position='absolute' top={-30} width={1}>
              {prices.length > 0 && (
                <LineChart
                  data={prices}
                  width='100%'
                  height={120}
                  color={priceUp ? palette.success.main : palette.error.main}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Skeleton variant='rect' width={88} height={47} />
        )}
      </Box>
      <Box className='border-top-secondary1 border-bottom-secondary1' px={2}>
        <Grid container>
          <Grid item xs={6}>
            <Box className='border-right-secondary1' py={1}>
              {tokenData ? (
                <small className='text-secondary'>
                  {t('tvl')}: {formatCompact(tokenData?.totalLiquidityUSD)}
                </small>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box py={1} pl={2}>
              {tokenData ? (
                <small className='text-secondary'>
                  {t('24hVol1')}: {formatCompact(tokenData?.oneDayVolumeUSD)}
                </small>
              ) : (
                <Skeleton variant='rect' width={100} height={16} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box className='flex items-center justify-between' py={1} px={2}>
        <a
          href={`${process.env.REACT_APP_SCAN_BASE_URL}/token/${tokenAddress}`}
          target='_blank'
          rel='noopener noreferrer'
          className='no-decoration'
        >
          <small className='text-primary'>{shortenAddress(tokenAddress)}</small>
        </a>
        <CopyHelper toCopy={tokenAddress} />
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;