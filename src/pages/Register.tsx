
import React from "react";
import Layout from "@/components/Layout";
import RegistrationForm from "@/components/RegistrationForm";
import RegistrationCard from "@/components/RegistrationCard";

const Register = () => {
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-8">
        <RegistrationCard>
          <RegistrationForm />
        </RegistrationCard>
      </div>
    </Layout>
  );
};

export default Register;
