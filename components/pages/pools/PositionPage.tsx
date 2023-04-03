import React, { useMemo } from 'react';
import {
  useV3PositionFromTokenId,
  useV3Positions,
} from 'hooks/v3/useV3Positions';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BigNumber } from '@ethersproject/bignumber';
import Loader from 'components/Loader';
import usePrevious from 'hooks/usePrevious';
import { Box } from '@mui/material';
import PositionListItem from './MyLiquidityPoolsV3/components/PositionListItem';
import { useActiveWeb3React } from 'hooks';
import { PositionPool } from 'models/interfaces';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { useV3NFTPositionManagerContract } from 'hooks/useContract';
import { FARMING_CENTER } from 'constants/v3/addresses';
import { useTranslation } from 'next-i18next';

export default function PositionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const tokenIdFromUrl = router.query.tokenId
    ? (router.query.tokenId as string)
    : undefined;
  const { account, chainId } = useActiveWeb3React();

  const parsedTokenId = tokenIdFromUrl
    ? BigNumber.from(tokenIdFromUrl)
    : undefined;
  const { loading, position: _positionDetails } = useV3PositionFromTokenId(
    parsedTokenId,
  );

  const { loading: positionLoading, positions } = useV3Positions(account);
  const ownsNFT =
    positions &&
    !!positions.find((item) => item.tokenId.toString() === tokenIdFromUrl);

  const positionManager = useV3NFTPositionManagerContract();
  const owner = useSingleCallResult(
    !!parsedTokenId ? positionManager : null,
    'ownerOf',
    [parsedTokenId],
  ).result?.[0];

  const prevPositionDetails = usePrevious({ ..._positionDetails });
  const {
    token0: _token0Address,
    token1: _token1Address,
    liquidity: _liquidity,
    tickLower: _tickLower,
    tickUpper: _tickUpper,
  } = useMemo(() => {
    if (
      !_positionDetails &&
      prevPositionDetails &&
      prevPositionDetails.liquidity
    ) {
      return { ...prevPositionDetails };
    }
    return { ..._positionDetails };
  }, [_positionDetails, prevPositionDetails]);

  const positionDetails: PositionPool | undefined = _positionDetails
    ? {
        ..._positionDetails,
        onFarming: chainId && owner === FARMING_CENTER[chainId],
      }
    : undefined;

  return (
    <>
      {(loading || positionLoading) && (
        <Box padding={4} className='flex justify-center'>
          <Loader stroke={'white'} size={'2rem'} />
        </Box>
      )}

      {!loading && !positionLoading && (
        <>
          <Box mb={2}>
            <Link
              className='text-primary p'
              style={{ textDecoration: 'none' }}
              href='/pools/v3'
            >
              ← {t('backPoolOverview')}
            </Link>
          </Box>
          {positionDetails ? (
            <PositionListItem
              positionDetails={positionDetails}
              hideExpand={true}
              ownsNFT={ownsNFT}
            />
          ) : (
            <p>{t('nftNotExist')}</p>
          )}
        </>
      )}
    </>
  );
}