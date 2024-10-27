"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateChit = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    chit_name: "",
    chit_type: "Commission-Based" as "Commission-Based" | "Fixed",
    auction_type: "",
    total_chit_value: 0,
    start_date: "",
    duration: 0,
    number_of_members: 0,
    contribution_amount: 0,
    description: "",
    terms_and_conditions: "",
    commission_percentage: 0,
    status: "draft" as "published" | "draft",
  });

  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInviteUser = () => {
    if (inviteEmail && !invitedUsers.includes(inviteEmail)) {
      setInvitedUsers([...invitedUsers, inviteEmail]);
      setInviteEmail("");
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    const submitData = {
      ...formData,
      status,
      auction_type: formData.auction_type,
      chit_name: formData.chit_name,
      chit_type: formData.chit_type,
      total_chit_value: formData.total_chit_value,
      start_date: formData.start_date,
      duration: formData.duration,
      number_of_members: formData.number_of_members,
      contribution_amount: formData.contribution_amount,
      description: formData.description,
      terms_and_conditions: formData.terms_and_conditions,
      commission_percentage: formData.commission_percentage,
    };

    const { data, error } = await supabase.from("chits").insert([submitData]);

    if (error) {
      console.error("Error inserting data:", error.message);
      console.error("Error details:", error);
    } else {
      console.log("Data inserted successfully:", data);
      setFormData({
        chit_name: "",
        chit_type: "Commission-Based" as "Commission-Based" | "Fixed",
        auction_type: "",
        total_chit_value: 0,
        start_date: "",
        duration: 0,
        number_of_members: 0,
        contribution_amount: 0,
        description: "",
        terms_and_conditions: "",
        commission_percentage: 0,
        status: "draft" as "published" | "draft",
      });
      setInvitedUsers([]);
    }

    console.log("Submitting data:", submitData);
  };

  const renderStepOne = () => (
    <div className="flex flex-col items-center justify-center text-center h-screen ">
      <h2>Chit Details</h2>
      <div className="container d-flex justify-content-center  ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-50">
          <div className="form-floating mb-3">
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="chit_name"
                name="chit_name"
                value={formData.chit_name}
                onChange={handleChange}
                placeholder=" " // Add a space for the floating effect
                required // Ensures a floating label when the input is focused
              />
              <label htmlFor="chit_name">Chit Name</label>
            </div>
          </div>

          <div className=" mb-3">
            <select
              name="chit_type"
              value={formData.chit_type}
              onChange={handleChange}
              className="w-full p-2 border rounded form-select"
            >
              <option value="" hidden>
                Chit Type
              </option>
              <option value="Commission-Based">Commission Based</option>
              <option value="Fixed">Fixed</option>
            </select>
          </div>

          <div className="mb-3">
            <select
              name="auction_type"
              value={formData.auction_type}
              onChange={handleChange}
              className="w-full p-2 border rounded form-select"
            >
              <option value=" " hidden>
                {" "}
                Auction Type
              </option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className="form-floating mb-3">
            <input
              type="number"
              className="form-control"
              id="total_chit_value"
              name="total_chit_value"
              value={formData.total_chit_value}
              onChange={handleChange}
              placeholder=" " // Add a space for the floating effect
              aria-label="Total Chit Value"
              required // Ensures a floating label when the input is focused
            />
            <label htmlFor="total_chit_value">Total Chit Value</label>
          </div>

          <div className="mb-3">
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                id="contribution_amount"
                name="contribution_amount"
                value={formData.contribution_amount}
                onChange={handleChange}
                placeholder=" " // Add a space for the floating effect
                aria-label="Contribution Amount"
                required // Ensures a floating label when the input is focused
              />
              <label htmlFor="contribution_amount">Contribution Amount</label>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                id="number_of_members"
                name="number_of_members"
                value={formData.number_of_members}
                onChange={handleChange}
                placeholder=" " // Add a space for the floating effect
                aria-label="Number of Members"
                required // Ensures a floating label when the input is focused
              />
              <label htmlFor="number_of_members">Number of Members</label>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-floating">
              <input
                type="date"
                className="form-control"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                placeholder=" " // Add a space for the floating effect
                aria-label="Start Date"
                required // Ensures a floating label when the input is focused
              />
              <label htmlFor="start_date">Start Date</label>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder=" " // Add a space for the floating effect
                aria-label="Duration"
                required // Ensures a floating label when the input is focused
              />
              <label htmlFor="duration">Duration</label>
            </div>
          </div>

          {formData.chit_type === "Commission-Based" && (
            <div className="mb-3">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control"
                  id="commission_percentage"
                  name="commission_percentage"
                  value={formData.commission_percentage}
                  onChange={handleChange}
                  placeholder=" " // Add a space for the floating effect
                  aria-label="Commission Percentage"
                  required // Ensures a floating label when the input is focused
                />
                <label htmlFor="commission_percentage">
                  Commission Percentage
                </label>
              </div>
            </div>
          )}

          <div className="mb-3">
            <div className="form-floating">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                id="description" // Add an ID for label association
                placeholder=" " // Add a space for the floating effect
                rows={3}
                aria-label="Description"
                required // Ensures a floating label when the textarea is focused
              />
              <label htmlFor="description">Description</label>
            </div>
          </div>
          <div className=" input-group mb-3">
            <div className="form-floating">
              <textarea
                name="terms_and_conditions"
                value={formData.terms_and_conditions}
                onChange={handleChange}
                className="form-control w-100"
                id="terms_and_conditions" // Add an ID for label association
                placeholder=" " // Add a space for the floating effect
                rows={3}
                aria-label="Terms and Conditions"
                required // Ensures a floating label when the textarea is focused
              />
              <label htmlFor="terms_and_conditions">Terms and Conditions</label>
            </div>
          </div>

          {/* <div className="input-group mb-3">
            <span className="input-group-text">Terms and Conditions</span>
            <textarea
              name="terms_and_conditions"
              value={formData.terms_and_conditions}
              onChange={handleChange}
              className="form-control"
              aria-label="With textarea"
              rows={3}
            />
          </div> */}
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="container container d-flex justify-content-center w-100">
      <div className="space-y-4 w-50">
        <h2 className="text-xl font-bold mb-4">Invite Users</h2>

        <div className="mb-3">
          <div className="form-floating">
            <input
              type="email"
              className="form-control"
              id="inviteEmail" // Add an ID for label association
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder=" " // Add a space for the floating effect
              required // Optional: to enforce input validation
            />
            <label htmlFor="inviteEmail">Enter email address</label>
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <button
              onClick={handleInviteUser}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded btn btn-warning"
            >
              Invite
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2">Invited Users:</h3>
          {invitedUsers.length > 0 ? (
            <ul className="space-y-2">
              {invitedUsers.map((email, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  {email}
                  <button
                    onClick={() =>
                      setInvitedUsers(
                        invitedUsers.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No users invited yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="container container d-flex justify-content-center w-100">
      <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Overview and Publish</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
        <div>
          <p >
            <strong>Chit Name:</strong> {formData.chit_name}
          </p>
          <p>
            <strong>Chit Type:</strong> {formData.chit_type}
          </p>
          <p>
            <strong>Total Value:</strong> {formData.total_chit_value}
          </p>
          <p>
            <strong>Contribution:</strong> {formData.contribution_amount}
          </p>
          <p>
            <strong>Number of Members:</strong> {formData.number_of_members}
          </p>
          <p>
            <strong>Start Date:</strong> {formData.start_date}
          </p>
          <p>
            <strong>Duration:</strong> {formData.duration}
          </p>
          <p>
            <strong>Description:</strong> {formData.description}
          </p>
          <p>
            <strong>Terms and Conditions:</strong>{" "}
            {formData.terms_and_conditions}
          </p>
        </div>
        <div>
          {formData.chit_type === "Commission-Based" && (
            <p>
              <strong>Commission:</strong> {formData.commission_percentage}%
            </p>
          )}
          <p>
            <strong>Invited Users:</strong> {invitedUsers.length}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => handleSubmit("draft")}
          className="px-6 py-2 bg-gray-500 text-white rounded btn btn-warning"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit("published")}
          className="px-6 py-2 bg-blue-500 text-white rounded btn btn-warning"
        >
          Publish Chit
        </button>
      </div>
    </div>
    </div>
    
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= num ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && renderStepOne()}
      {step === 2 && renderStepTwo()}
      {step === 3 && renderStepThree()}

      <div className="flex justify-center mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-gray-500 text-white rounded btn btn-warning"
          >
            Previous
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded ml-4 btn btn-warning"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateChit;
