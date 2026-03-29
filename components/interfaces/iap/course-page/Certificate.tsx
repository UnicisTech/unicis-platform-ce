import React from 'react';
import {
  PDFDownloadLink,
  Page,
  Text,
  Font,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Button } from '@/components/shadcn/ui/button';
import type { Course } from 'types';
import { useTranslation } from 'next-i18next';

interface CertificateProps {
  userName: string;
  course: Course;
}

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

const styles = StyleSheet.create({
  body: { paddingTop: 35, paddingBottom: 65, paddingHorizontal: 35 },
  title: { fontSize: 24, textAlign: 'center', fontFamily: 'Oswald' },
  coursetitle: {
    fontSize: 24,
    fontWeight: 'extrabold',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  company: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  date: { fontSize: 18, margin: 12, textAlign: 'center', fontFamily: 'Roboto' },
  text: { margin: 12, fontSize: 14, textAlign: 'center', fontFamily: 'Roboto' },
  program: {
    margin: 12,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  image: { marginVertical: 15, marginHorizontal: 100 },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: 'grey',
  },
});

const Quixote = ({ userName, course }: CertificateProps) => {
  const { t, i18n } = useTranslation('common');

  const formattedDate = new Intl.DateTimeFormat(i18n.language || 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <Document>
      <Page wrap={false} style={styles.body}>
        <Text style={styles.header} fixed>
          {t('iap-header', { brand: 'Unicis.Tech OÜ' })}
        </Text>
        <Text style={styles.title}>{t('certificate-of-training')}</Text>
        <Text style={styles.company}>{userName}</Text>
        <Image
          style={styles.image}
          src="https://www.unicis.tech/img/unicis-logo-cert.png"
        />
        <Text style={styles.subtitle}>{userName}</Text>
        <Text style={styles.text}>{t('has-successfully-completed')}</Text>
        <Text style={styles.coursetitle}>{course.name}</Text>
        <Text style={styles.text}>{t('on-date')}</Text>
        <Text style={styles.date}>{formattedDate}</Text>

        {course.programContent && (
          <>
            <Text style={styles.program}>{t('program-contents')}</Text>
            <Text style={styles.text}>{course.programContent}</Text>
          </>
        )}
      </Page>
    </Document>
  );
};

const Certificate = ({ userName, course }: CertificateProps) => {
  const { t } = useTranslation('common');

  return (
    <PDFDownloadLink
      document={<Quixote userName={userName} course={course} />}
      fileName={`${userName} ${course.name} Certificate.pdf`}
    >
      <Button variant="outline" className="mt-2">
        {t('download-certificate')}
      </Button>
    </PDFDownloadLink>
  );
};

export default Certificate;
