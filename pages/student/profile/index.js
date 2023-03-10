import Stud_profile_form from "../../../components/ProfileStud/stud_profile_form";

import Student from "../../../models/student";
import Certificate_Student from "../../../models/certificate_student";
import Badge_Student from "../../../models/badge_student";
import Badge from "../../../models/badge";
import Certificate from "../../../models/certificate";

import { getSession } from "next-auth/react";
import connectMongo from "../../../utils/connectMongo";

const StudProfile = ({ studentData, certificatesData, badgesData }) => {
  return (
    <div>
      <Stud_profile_form
        details={studentData}
        Certificates={certificatesData}
        Badges={badgesData}
      />
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/educator/login",
        permanent: false,
      },
    };
  }

  try {
    await connectMongo();

    const student = await Student.findOne({ email: session.user.email });

    const certStudent = await Certificate_Student.find({
      studentID: student._id,
    });

    const badgeStudent = await Badge_Student.find({
      studentID: student._id,
    });

    // console.log("stage 1");
    // console.log(certStudent);
    // console.log(badgeStudent);

    const certificates = certStudent.map(async (certStud) => {
      return await Certificate.findById(certStud.certificateID);
    });

    const badges = badgeStudent.map(async (badgeStud) => {
      return await Badge.findById(badgeStud.badgeID);
    });

    // console.log("stage 2");

    const certificatesData = await Promise.all(certificates).then((values) => {
      return values;
    });

    const badgesData = await Promise.all(badges).then((values) => {
      return values;
    });

    // console.log("stage 3");
    // console.log(certificatesData);
    // console.log(badgesData);
    // console.log("the end");

    return {
      props: {
        studentData: JSON.parse(JSON.stringify(student)),
        certificatesData: JSON.parse(JSON.stringify(certificatesData)),
        badgesData: JSON.parse(JSON.stringify(badgesData)),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default StudProfile;
