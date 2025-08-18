import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Submission } from '../../types';

import { logoBase64 } from '../../assets/logoBase64';

import { SpaceGroteskRegular, SpaceGroteskBold } from './fonts/SpaceGrotesk';

// Register system fonts
Font.register({
  family: 'CustomFont',
  fonts: [
    { src: 'Times-Roman' },
    { src: 'Times-Bold', fontWeight: 'bold' }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#0a0a0a',
    padding: 0,
    color: '#ffffff',
    fontFamily: 'CustomFont',
  },
  coverPage: {
    backgroundColor: '#0a0a0a',
    padding: 60,
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60,
  },
  coverLogo: {
    width: 120,
    height: 'auto',
  },
  coverHeaderRight: {
    textAlign: 'right',
    fontSize: 10,
    color: '#9ca3af',
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
    letterSpacing: -1,
  },
  coverSubtitle: {
    fontSize: 24,
    color: '#9333ea',
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  coverCompanyInfo: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  coverCompanyName: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  contentPage: {
    padding: 60,
    backgroundColor: '#0a0a0a',
    minHeight: '100%',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  logo: {
    width: 80,
    height: 'auto',
  },
  headerRight: {
    textAlign: 'right',
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    letterSpacing: -0.5,
    borderBottom: '2px solid rgba(147, 51, 234, 0.3)',
    paddingBottom: 8,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#d1d5db',
    marginBottom: 16,
  },
  highlight: {
    color: '#9333ea',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginVertical: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  timeline: {
    marginVertical: 30,
    paddingLeft: 20,
    borderLeft: '2px solid #9333ea',
  },
  timelineItem: {
    marginBottom: 24,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -26,
    width: 12,
    height: 12,
    backgroundColor: '#9333ea',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 10,
    color: '#9ca3af',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
  },
});

interface ProposalDocumentProps {
  submission: Submission;
}

const ProposalDocument: React.FC<ProposalDocumentProps> = ({ submission }) => {
  const formatBudget = (budget: string) => {
    const num = parseInt(budget.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num);
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <View>
            <View style={styles.coverHeader}>
              <Image src={logoBase64} style={styles.coverLogo} />
              <View style={styles.coverHeaderRight}>
                <Text style={styles.coverDate}>{new Date().toLocaleDateString()}</Text>
                <Text style={styles.coverDate}>Ref: {submission.id.substring(0, 8)}</Text>
              </View>
            </View>

            <View style={{ marginTop: 80 }}>
              <Text style={styles.coverTitle}>AI Integration{'\n'}Proposal</Text>
              <Text style={styles.coverSubtitle}>Transform Your Business with{'\n'}Intelligent Automation</Text>
            </View>
          </View>

          <View style={styles.coverCompanyInfo}>
            <Text style={styles.coverCompanyName}>Prepared for {submission.companyName}</Text>
            <Text style={styles.coverDate}>Valid until {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
          </View>
        </View>
      </Page>

      {/* Executive Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <View style={styles.header}>
            <Image src={logoBase64} style={styles.logo} />
            <View style={styles.headerRight}>
              <Text style={styles.text}>{submission.companyName}</Text>
              <Text style={styles.text}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.text}>
              {submission.generatedQuote.split('## 2. Strategic Analysis')[0].replace('# 1. Executive Brief', '').trim()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategic Analysis</Text>
            <View style={styles.table}>
              {submission.challenges.map((challenge, index) => (
                <View key={index} style={[styles.tableRow, { marginBottom: index === submission.challenges.length - 1 ? 0 : 20 }]}>
                  <View style={{ flex: 1, padding: 16, backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: 4, marginRight: 10, border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                    <Text style={[styles.text, { color: '#9333ea', fontWeight: 'bold', marginBottom: 8 }]}>Current Challenge</Text>
                    <Text style={[styles.text, { color: '#d1d5db' }]}>{challenge}</Text>
                  </View>
                  <View style={{ flex: 1, padding: 16, backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: 4, marginLeft: 10, border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                    <Text style={[styles.text, { color: '#9333ea', fontWeight: 'bold', marginBottom: 8 }]}>AI-Driven Solution</Text>
                    <Text style={[styles.text, { color: '#d1d5db' }]}>Automated optimization and intelligent processing</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>TulipAI © {new Date().getFullYear()}</Text>
            <Text style={styles.footerText}>contact@tulipai.nl</Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => (`Page ${pageNumber}`)} fixed />
        </View>
      </Page>

      {/* Solutions Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <View style={styles.header}>
            <Image src={logoBase64} style={styles.logo} />
            <View style={styles.headerRight}>
              <Text style={styles.text}>{submission.companyName}</Text>
              <Text style={styles.text}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Proposed Solutions</Text>
            {submission.solutions.map((solution, index) => (
              <View key={index} style={{ marginBottom: index === submission.solutions.length - 1 ? 0 : 30, padding: 24, backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: 8, border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                <Text style={[styles.text, { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 }]}>{solution}</Text>
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.text, { color: '#9333ea', marginBottom: 12, fontWeight: 'bold' }]}>Key Benefits:</Text>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={[styles.text, { color: '#d1d5db', marginBottom: 8 }]}>• 30-40% reduction in processing time</Text>
                    <Text style={[styles.text, { color: '#d1d5db', marginBottom: 8 }]}>• 50% improvement in accuracy</Text>
                    <Text style={[styles.text, { color: '#d1d5db', marginBottom: 8 }]}>• Streamlined operations and workflow</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>TulipAI © {new Date().getFullYear()}</Text>
            <Text style={styles.footerText}>contact@tulipai.nl</Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => (`Page ${pageNumber}`)} fixed />
        </View>
      </Page>

      {/* Implementation Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <View style={styles.header}>
            <Image src={logoBase64} style={styles.logo} />
            <View style={styles.headerRight}>
              <Text style={styles.text}>{submission.companyName}</Text>
              <Text style={styles.text}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={[styles.section, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Implementation Timeline</Text>
            <Text style={[styles.text, { marginBottom: 30, fontSize: 14 }]}>Total Duration: {submission.timeline}</Text>
            
            <View style={[styles.timeline, { marginLeft: 20 }]}>
              {['Discovery & Planning', 'Development', 'Integration', 'Launch'].map((phase, index) => (
                <View key={phase} style={[styles.timelineItem, { marginBottom: index === 3 ? 0 : 30 }]}>
                  <View style={styles.timelineDot} />
                  <Text style={[styles.timelineTitle, { marginBottom: 8 }]}>{phase}</Text>
                  <Text style={styles.timelineText}>
                    {index === 0 ? 'Initial assessment and strategy development' :
                     index === 1 ? 'Core development and testing phase' :
                     index === 2 ? 'System integration and optimization' :
                     'Final deployment and team training'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment Overview</Text>
            <View style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', padding: 30, borderRadius: 8, border: '1px solid rgba(147, 51, 234, 0.2)' }}>
              <Text style={[styles.text, { fontSize: 28, color: '#9333ea', marginBottom: 20, textAlign: 'center' }]}>
                {formatBudget(submission.budget)}
              </Text>
              <Text style={[styles.text, { marginBottom: 20, fontSize: 14, color: '#ffffff', textAlign: 'center' }]}>
                Comprehensive Package Including:
              </Text>
              <View style={{ marginLeft: 20 }}>
                <Text style={[styles.text, { marginBottom: 12, fontSize: 12, color: '#d1d5db' }]}>• Full implementation and integration</Text>
                <Text style={[styles.text, { marginBottom: 12, fontSize: 12, color: '#d1d5db' }]}>• Team training and documentation</Text>
                <Text style={[styles.text, { marginBottom: 12, fontSize: 12, color: '#d1d5db' }]}>• Ongoing support and optimization</Text>
                <Text style={[styles.text, { marginBottom: 0, fontSize: 12, color: '#d1d5db' }]}>• Regular performance reviews</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>TulipAI © {new Date().getFullYear()}</Text>
            <Text style={styles.footerText}>contact@tulipai.nl</Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => (`Page ${pageNumber}`)} fixed />
        </View>
      </Page>
    </Document>
  );
};

export default ProposalDocument;