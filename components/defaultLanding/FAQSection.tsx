import { useTranslation } from 'next-i18next';
import DaisyCard from '../shared/daisyUI/DaisyCard';

import faqs from './data/faq.json';

const FAQSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('frequently-asked')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-2">
            {faqs.map((faq, index) => {
              return (
                <DaisyCard key={index} className="border-none">
                  <DaisyCard.Body className="items-left dark:border-gray-200 border border-gray-300">
                    <DaisyCard.Title tag="h2">
                      Q. {faq.question}
                    </DaisyCard.Title>
                    <p>A. {faq.answer}</p>
                  </DaisyCard.Body>
                </DaisyCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
