import { Document, Page, View, Text, Image, Font, StyleSheet } from '@react-pdf/renderer'

// Register Roboto font with Cyrillic support from local files
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/Roboto-Medium.ttf',
      fontWeight: 500,
    },
    {
      src: '/fonts/Roboto-Bold.ttf',
      fontWeight: 700,
    },
  ],
})

const HEADER_COLOR = '#1e2939'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    paddingBottom: 40,
  },
  header: {
    height: 60,
    backgroundColor: HEADER_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 128,
    height: 36,
  },
  content: {
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  productName: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'justify',
  },
  modelNumberLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modelNumber: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modelDescription: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 30,
    textAlign: 'justify',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  productImage: {
    maxWidth: 300,
    maxHeight: 300,
    objectFit: 'contain',
  },
})

export interface ProductPdfData {
  productName: string
  modelNumber: string
  modelNumberLabel?: string
  description: string
  modelDescription?: string | null
  descriptionLabel?: string
  imageUrl?: string | null
  logoUrl: string
}

interface ProductPdfDocumentProps {
  data: ProductPdfData
}

export function ProductPdfDocument({ data }: ProductPdfDocumentProps) {
  const {
    productName,
    modelNumber,
    modelNumberLabel,
    description,
    modelDescription,
    descriptionLabel,
    imageUrl,
    logoUrl,
  } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
        </View>

        <View style={styles.content}>
          <Text style={styles.productName}>{productName}</Text>

          {description && <Text style={styles.heroDescription}>{description}</Text>}

          <Text style={styles.modelNumberLabel}>
            {modelNumberLabel || 'Model Number:'}
          </Text>
          <Text style={styles.modelNumber}>{modelNumber}</Text>

          {modelDescription && (
            <>
              <Text style={styles.descriptionLabel}>
                {descriptionLabel || 'Description:'}
              </Text>
              <Text style={styles.modelDescription}>{modelDescription}</Text>
            </>
          )}

          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image src={imageUrl} style={styles.productImage} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
