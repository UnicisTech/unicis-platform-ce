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
import Button from '@atlaskit/button';
import { Course } from '@prisma/client';

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
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Oswald',
  },
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
  date: {
    fontSize: 18,
    margin: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  program: {
    margin: 12,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: 'grey',
  },
});

const Quixote = ({ userName, course }: CertificateProps) => (
  <Document>
    <Page wrap={false} style={styles.body}>
      <Text style={styles.header} fixed>
        ~ Unicis.Tech OÜ - Interactive Awareness Program ~
      </Text>
      <Text style={styles.title}>Certificate of Training</Text>
      <Text style={styles.company}>{userName}</Text>
      <Image
        style={styles.image}
        src="https://www.unicis.tech/img/unicis-logo-cert.png"
      />
      <Text style={styles.subtitle}>{userName}</Text>
      <Text style={styles.text}>has successfully completed:</Text>
      <Text style={styles.coursetitle}>{course.name}</Text>
      <Text style={styles.text}>on</Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      {course.programContent && (
        <>
          <Text style={styles.program}>Program contents:</Text>
          <Text style={styles.text}>{course.programContent}</Text>
        </>
      )}
    </Page>
  </Document>
);

const Certificate = ({ userName, course }: CertificateProps) => {
  return (
    <PDFDownloadLink
      document={<Quixote userName={userName} course={course} />}
      fileName={`${userName} ${course.name} Certificate.pdf`}
    >
      <Button style={{ marginTop: '5px' }}>Download certificate</Button>
    </PDFDownloadLink>
  );
};

export default Certificate;
