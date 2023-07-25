import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { WalletOptionProps } from './WalletOptionProps';
import styles from 'styles/components/WalletModal.module.scss';

const IconifyOption: React.FC<WalletOptionProps> = ({
  header,
  icon,
  active,
  id,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      id={id}
      onClick={onClick}
      className={`flex items-center flex-col ${styles.optionCardIconfiy}`}
      my={1.5}
      mx={1.5}
    >
      <Box className={styles.optionIconContainer}>
        <img className='m-auto' src={icon} alt={'Icon'} width={48} />
      </Box>
      <Box className={styles.optionHeader} mt={0.5}>
        {header}
      </Box>
      {active && (
        <Box className='flex items-center'>
          <Box className='optionConnectedDot' />
          <small>{t('connected')}</small>
        </Box>
      )}
    </Box>
  );
};

export default IconifyOption;
