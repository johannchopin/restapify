import faker from 'faker'
import { RestapifyErrorName } from './types/restapify'

export type FakerLocale = 'az' | 'ar' | 'cz' | 'de' | 'de_AT' | 'de_CH' | 'en' | 'en_AU' | 'en_AU_ocker' | 'en_BORK' | 'en_CA' | 'en_GB' | 'en_IE' | 'en_IND' | 'en_US' | 'en_ZA' | 'es' | 'es_MX' | 'fa' | 'fi' | 'fr' | 'fr_CA' | 'fr_CH' | 'ge' | 'hy' | 'hr' | 'id_ID' | 'it' | 'ja' | 'ko' | 'nb_NO' | 'ne' | 'nl' | 'nl_BE' | 'pl' | 'pt_BR' | 'pt_PT' | 'ro' | 'ru' | 'sk' | 'sv' | 'tr' | 'uk' | 'vi' | 'zh_CN' | 'zh_TW'

const LOCALES: FakerLocale[] = ['az', 'ar', 'cz', 'de', 'de_AT', 'de_CH', 'en', 'en_AU', 'en_AU_ocker', 'en_BORK', 'en_CA', 'en_GB', 'en_IE', 'en_IND', 'en_US', 'en_ZA', 'es', 'es_MX', 'fa', 'fi', 'fr', 'fr_CA', 'fr_CH', 'ge', 'hy', 'hr', 'id_ID', 'it', 'ja', 'ko', 'nb_NO', 'ne', 'nl', 'nl_BE', 'pl', 'pt_BR', 'pt_PT', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk', 'vi', 'zh_CN', 'zh_TW']

export const getFakerInstance = (locale = 'en'): typeof faker => {
  // @ts-ignore
  const isLocaleValid = LOCALES.includes(locale)

  if (!isLocaleValid) {
    const error: RestapifyErrorName = 'ERR'
    const errorObject = {
      error,
      message: `The given locale ${locale} is not valid! Please refer to the documentation https://github.com/Marak/faker.js#localization`
    }
    throw new Error(JSON.stringify(errorObject))
  }

  faker.locale = locale
  return faker
}
