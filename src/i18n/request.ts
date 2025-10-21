import {getRequestConfig} from 'next-intl/server';
import "../../messages/vi.json"


export default getRequestConfig(async () => {
  // Static for now, we'll change this later
  const locale = "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});