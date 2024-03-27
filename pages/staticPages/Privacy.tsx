
import MDRender from "../../components/MdRender/MdRender";
export default function Privacy() {
  // --------------------------------------------------------------
  const markdownText = `
# **Privacy Policy**
# &nbsp;

**Doc Last Updated Date:** February 24, 2024

Welcome to MetaMail, the privacy-focused, end-to-end encrypted email service ("Service"). MetaMail is dedicated to safeguarding the privacy and security of our users' information. This Privacy Policy explains our practices regarding the collection, use, and sharing of your information when you utilize our Service.
# &nbsp;
## **Legal Compliance**

MetaMail adheres to all applicable laws and regulations regarding data protection and user privacy. This includes compliance with regulations such as the General Data Protection Regulation (GDPR) for our users in the European Union, the California Consumer Privacy Act (CCPA) for our users in California, USA, and any other data protection laws relevant to the regions where we operate.

Please be aware that the use of MetaMail is also subject to our Terms of Service, which outline the eligibility requirements for our users. We encourage you to review our Terms of Service to determine if you are eligible to use MetaMail.
# &nbsp;
## **Information We Collect**

**Account Information:** To access our Service, you authenticate using your wallet's signature. Consequently, your blockchain address becomes known to us. Please be aware that any transactions or information associated with your address are publicly accessible on the blockchain. In accordance with our protocol, you locally generate a key pair along with associated metadata, which is designed to assist with the local decryption of your encrypted private key. You then upload the encrypted key pair and metadata to our servers. Your public key is meant to be accessible by anyone to enable encrypted communication, while your encrypted private key is securely stored on our servers in a way that ensures only you, with your blockchain account's private key, can decrypt it.

**Communications:** Your emails are end-to-end encrypted within our Service. Please be aware that MetaMail can send and receive emails to and from external email services, but those emails will be unencrypted.

We currently do not collect Usage Data, which includes but is not limited to, access times, device information, IP addresses, browser types, language preferences, pages viewed, and the order of those pages. However, we reserve the right to collect such information in the future to improve service functionality and user experience. Should we decide to collect additional data, this policy will be updated to reflect the changes and provide transparency about the data being collected and the purposes for its collection.
# &nbsp;
## **How We Use Your Information**

- To facilitate secure access to our Service using your wallet signature.
- To provide, maintain, and improve the Service.
- To communicate with you, including responding to your support needs.
- To enforce our terms, conditions, and policies.
- To comply with legal requirements.
# &nbsp;
## **Data Security**

We use advanced security measures to protect your stored personal data, including encryption and secure key management. Our security measures are continually enhanced in response to technological advancements.

Please be aware that data transmission over the Internet cannot be guaranteed to be 100% secure. While we strive to protect your information, we cannot warrant the security of any information you transmit to us via the Internet.
# &nbsp;
## **Your Rights**

You maintain the right to control your personal information. Should you wish to access, correct, or delete any personal information we hold, please contact us at [metamail@mmail.ink](mailto:metamail@mmail.ink). Please note that as your private key is encrypted, we are unable to decrypt it and access information that you have encrypted. Our ability to amend your data is limited to correcting inaccuracies in any data that we can access.
# &nbsp;
## **Updates to our Privacy Policy**

MetaMail may update this Privacy Policy from time to time and inform you on the Websites that the policy has been amended. The current version of the Privacy Policy, as published on our Website, is applicable. With each update to our policies, we will note which sections have been updated.
# &nbsp;
## **Contact Us**

If you have any inquiries regarding this Privacy Policy, please contact us at [metamail@mmail.ink](mailto:metamail@mmail.ink).

By using MetaMail, you acknowledge that you have read and understood this Privacy Policy.

  `;
  // --------------------------------------------------------------
  return (
    <>
      <MDRender
        markdownText={markdownText}
      />
    </>

  )
}