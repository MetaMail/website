
import MDRender from "../../components/MdRender/MdRender";
export default function TermsOfService() {

  // --------------------------------------------------------------
  const markdownText = `
# **Terms of Service**
# &nbsp;
**Doc Last Updated Date:** February 24, 2024
# &nbsp;
## **Acceptance of the Terms of Service**


Welcome to MetaMail! Please read the Terms of Service carefully before you start to use the Websites. These terms of service are entered into by and between you and MetaMail (the “MMail”, “we”, or “us”). The following terms and conditions, together with any documents they expressly incorporate by reference (collectively, these “Terms of Service”), govern your access to and use of any website published by MetaMail, including, but not limited to, any content, functionality, and services offered on or through metamail.ink, mmail-test.ink (the “Websites”).

Please read the Terms of Service carefully before you start to use the Websites. By using the Websites or by clicking to accept or agree to the Terms of Service when this option is made available to you, you accept and agree to be bound and abide by these Terms of Service in addition to our Privacy Policy.

If you do not agree to these Terms of Service, you must not access or use the Websites.
# &nbsp;
### **Definitions**

- **Service:** refers to the MetaMail platform, including any associated websites, applications, services, and features provided to you.
- **User:** refers to any individual or entity that uses the Service.
- **Content:** includes all forms of data, text, software, music, sound, photographs, graphics, video, messages, or other materials.
- **Law** or **Laws:** refers to any local, state, federal, national, or international statutes, regulations, ordinances, and other legal requirements that apply to the use of the Service and the conduct of the User.
# &nbsp;
## **Description of Service**


MetaMail is an email communication platform that allows users to send, receive, and manage email messages. The Service may also include additional features such as file attachments, calendar integration, and contact management.
# &nbsp;
## **Who May Use the Websites**


The Websites are offered and available to users who are 13 years of age or older. The Websites are not intended for children under 13 years of age. By using the Websites, you represent and warrant that you (i) are 13 years of age or older, (ii) are not barred to use the Websites under any applicable law, and (iii) are using the Websites only for your own personal use. If you do not meet these requirements, you must not access or use the Websites.

If you are in a location where end-to-end encryption is not allowed, you are prohibited from accessing or using the Site and the Services. Additionally, the use of virtual private networks (VPNs) or any other methods to circumvent geographical restrictions and access the Site and the Services is strictly forbidden.
# &nbsp;
## **Changes to the Terms of Service**


We may revise and update these Terms of Service from time to time in our sole discretion. All changes are effective immediately when we post them.

Your continued use of the Websites following the posting of revised Terms of Service means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.
# &nbsp;
## **Accessing the Websites and Account Security**


We reserve the right to withdraw or amend the Websites, and any service or material we provide on the Websites, in our sole discretion without notice. We do not guarantee that our Websites or any content on them will always be available. We will not be liable if for any reason all or any part of the Websites are unavailable at any time or for any period. From time to time, we may restrict access to some parts of the Websites, or entire Websites, to users.

You are responsible for:
- Making all arrangements necessary for you to have access to the Websites; and
- Ensuring that all persons who access the Websites through your internet connection are aware of these Terms of Service and comply with them.

To access the Websites or some of the resources it offers, you may be asked to provide certain registration details or other information. It is a condition of your use of the Websites that all the information you provide on the Websites is correct, current, and complete. You agree that all information you provide to use the Websites, including, but not limited to, using any interactive features on the Websites, is governed by our Privacy Policy, and you consent to all actions we may take with respect to your information that are consistent with our Privacy Policy.

You should use particular caution when inputting personal information onto the Websites on a public or shared computer so that others are not able to view or record your personal information.
# &nbsp;
## **Intellectual Property Rights**


The Websites and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video and audio, and the design, selection, and arrangement thereof), are owned by MetaMail, its licensors or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.

Unless otherwise marked,
(a) all material, data, and information on the Websites, such as data files, text, music, audio files or other sounds, photographs, videos, or other images, but excluding any software or computer code (collectively, the “Non-Code Content”) are licensed under the Creative Commons Attribution 4.0 International License; and
(b) all software or computer code (collectively, the “Code Content”) are licensed under the MIT License.
# &nbsp;
## **Trademarks**


The MetaMail name, and all related names, logos, product and service names, designs and slogans are trademarks of MetaMail or its affiliates or licensors. You must not use such marks without the prior written permission of MetaMail. All other names, logos, product and service names, designs and slogans on this Websites are the trademarks of their respective owners.
# &nbsp;
## **User Accounts**


To use certain features of the Service, you may be required to create a user account. You are responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account. You agree to provide accurate, complete, and up-to-date information during the registration process. MetaMail reserves the right to suspend or terminate your account if any information provided is found to be inaccurate, incomplete, or in violation of these Terms.
# &nbsp;
## **User Content**


You retain ownership of any content that you submit, post, or transmit through the Service (defined as the "User Content"). By submitting User Content, you grant MetaMail a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, distribute, and display the User Content for the purpose of providing the Service. You represent and warrant that you have the necessary rights to grant this license. MetaMail does not claim ownership over any User Content.
# &nbsp;
## **Prohibited Uses**


You may use the Websites only for lawful purposes and in accordance with these Terms of Service. You agree not to use the Websites:
- In any way that violates any applicable federal, state, local, or international law or regulation (including, without limitation, any laws regarding the export of data or software to and from the US or other countries);
- For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information or otherwise;
- To send, knowingly receive, upload, download, use, or re-use any material which does not comply with these Terms of Service;
- To transmit, or procure the sending of, any advertising or promotional

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