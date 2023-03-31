import { ChainId, currencyEquals, ETHER } from '@uniswap/sdk';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { NEW_QUICK_ADDRESS } from 'constants/v3/addresses';
import { useActiveWeb3React } from 'hooks';

export default function usePoolsRedirect() {
  const router = useRouter();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const currentPath = router.asPath;
  const currencyIdAParam = router.query.currencyIdA
    ? (router.query.currencyIdA as string)
    : undefined;
  const currencyIdBParam = router.query.currencyIdB
    ? (router.query.currencyIdB as string)
    : undefined;

  const redirectWithCurrency = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      let redirectPath = '';
      const currencyId = (isV2
      ? currencyEquals(currency, ETHER[chainIdToUse])
      : currency.isNative)
        ? 'ETH'
        : currency.address;
      if (isInput) {
        if (currencyIdAParam ?? router.query.currency0) {
          if (currencyIdAParam) {
            redirectPath = currentPath.replace(currencyIdAParam, currencyId);
          } else {
            redirectPath = currentPath.replace(
              `currency0=${router.query.currency0}`,
              `currency0=${currencyId}`,
            );
          }
        } else {
          if (router.pathname.includes('/add')) {
            redirectPath = `${currentPath}/${currencyId}/${
              currencyIdBParam
                ? currencyIdBParam
                : currencyId === 'ETH'
                ? NEW_QUICK_ADDRESS
                : 'ETH'
            }${router.query.version ? `/${router.query.version}` : ''}`;
          } else {
            // redirectPath = `${currentPath}${
            //   history.location.search === '' ? '?' : '&'
            // }currency0=${currencyId}`;
          }
        }
      } else {
        if (currencyIdBParam ?? router.query.currency1) {
          if (currencyIdBParam) {
            redirectPath = currentPath.replace(currencyIdBParam, currencyId);
          } else {
            redirectPath = currentPath.replace(
              `currency1=${router.query.currency1}`,
              `currency1=${currencyId}`,
            );
          }
        } else {
          if (router.pathname.includes('/add')) {
            redirectPath = `${currentPath}/${
              currencyIdAParam
                ? currencyIdAParam
                : currencyId === 'ETH'
                ? NEW_QUICK_ADDRESS
                : 'ETH'
            }/${currencyId}${
              router.query.version ? `/${router.query.version}` : ''
            }`;
          } else {
            // redirectPath = `${currentPath}${
            //   history.location.search === '' ? '?' : '&'
            // }currency1=${currencyId}`;
          }
        }
      }
      router.push(redirectPath);
    },
    [chainIdToUse, currencyIdAParam, currencyIdBParam, currentPath, router],
  );

  const redirectWithSwitch = useCallback(
    (currency: any, isInput: boolean, isV2 = true) => {
      const currencyId = (isV2
      ? currencyEquals(currency, ETHER[chainIdToUse])
      : currency.isNative)
        ? 'ETH'
        : currency.address;
      let redirectPath;
      if (isInput) {
        if (router.pathname.includes('/add')) {
          redirectPath = `/add/${currencyId}/${currencyIdAParam}${
            router.query.version ? `/${router.query.version}` : ''
          }`;
        } else {
          redirectPath = `${router.pathname}?currency0=${currencyId}&currency1=${router.query.currency0}`;
        }
      } else {
        if (router.pathname.includes('/add')) {
          redirectPath = `/add/${currencyIdBParam}/${currencyId}${
            router.query.version ? `/${router.query.version}` : ''
          }`;
        } else {
          redirectPath = `${router.pathname}?currency0=${router.query.currency1}&currency1=${currencyId}`;
        }
      }
      router.push(redirectPath);
    },
    [chainIdToUse, currencyIdAParam, currencyIdBParam, router],
  );

  return { redirectWithCurrency, redirectWithSwitch };
}
