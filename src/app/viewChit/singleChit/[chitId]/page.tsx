"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaSave } from "react-icons/fa";


interface Chit {
  id: number;
  chit_name: string;
  chit_type: string;
  auction_type: string;
  total_chit_value: number;
  contribution_amount: number;
  number_of_members: number;
  commission_percentage: number;
  start_date: string;
  duration: number;
  description: string;
  terms_and_conditions: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChitEntry {
  id: number;
  monthnumber: number;
  bidamount: number;
  prizedamount: number;
  premium: number;
  dividend: number;
  amountPaid: number;
  selectstatus: string;
  paidon: string;
  isEditing?: boolean;
}


export default function ChitDetails({
  params,
}: {
  params: Promise<{ chitId: string }>;
}) {
  const [chit, setChit] = useState<Chit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedChit, setEditedChit] = useState<Chit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchChit = async () => {
      const unwrappedParams = await params;
      const chitId = unwrappedParams.chitId;

      setIsLoading(true);
      const { data, error } = await supabase
        .from("chits")
        .select("*")
        .eq("id", chitId)
        .single();

      if (error) {
        console.error("Error fetching chit:", error.message);
        setError("Error fetching chit details");
      } else {
        setChit(data);
        setEditedChit(data);
      }
      setIsLoading(false);
    };

    fetchChit().catch((err) => {
      console.error("Error in fetchChit:", err);
      setError("Error fetching chit details");
      setIsLoading(false);
    });
  }, [params]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("addentries")
        .select("*")
        .eq("chit_id", chit?.id);

      if (error) {
        console.error("Error fetching entries:", error.message);
        setError("Error fetching entries");
      } else {
        setEntries(data);
      }
    };

    if (chit) {
      fetchEntries();
    }
  }, [chit]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedChit(chit);
  };

  const handleSave = async () => {
    if (editedChit) {
      try {
        if (chit) {
          const { error } = await supabase
            .from("chits")
            .update({ ...editedChit, updated_at: new Date().toISOString() })
            .eq("id", chit.id);

          if (error) throw error;
        } else {
          throw new Error("Chit is null");
        }
        setChit(editedChit);
        setIsEditing(false);
      } catch (err) {
        console.error("Error updating chit:", err);
        setError("Error updating chit details");
      }
    }
  };
  const handleEditRow = (entryId: number) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId ? { ...entry, isEditing: !entry.isEditing } : entry
      )
    );
  };

  const handleSaveRow = async (entry: ChitEntry) => {
    const { id, isEditing, ...entryData } = entry;
    const { error } = await supabase
      .from("addentries")
      .update(entryData)
      .eq("id", id);

    if (!error) {
      setEntries((prevEntries) =>
        prevEntries.map((e) =>
          e.id === id ? { ...entry, isEditing: false } : e
        )
      );
    }
  };

  const handleEntryChange = (entryId: number, field: string, value: any) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    );
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedChit((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name.includes("_value") ||
              name.includes("_amount") ||
              name.includes("_percentage") ||
              name === "duration" ||
              name === "number_of_members"
                ? parseFloat(value)
                : value,
          }
        : null
    );
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!chit) {
    return <div className="p-4">Chit not found</div>;
  }

  return (
    <div
      className="bg-light min-vh-100 d-flex align-items-center"
      style={{ overflowY: "auto" }}
    >
      <div className="container d-flex justify-content-center">
        <div
          className="card shadow-lg"
          style={{ width: "38rem", borderRadius: "20px", height: "100vh"  }}
        >
          <div className="card-body">
            <h2 className="text-center mb-4">{chit.chit_name}</h2>
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="row gx-4 gy-3">
                    <div className="col-md-6">
                      <label className="form-label">Chit Name</label>
                      <input
                        type="text"
                        name="chit_name"
                        className="form-control"
                        value={editedChit?.chit_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Chit Type</label>
                      <input
                        type="text"
                        name="chit_type"
                        className="form-control"
                        value={editedChit?.chit_type}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Total Value</label>
                      <input
                        type="number"
                        name="total_chit_value"
                        className="form-control"
                        value={editedChit?.total_chit_value}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contribution Amount</label>
                      <input
                        type="number"
                        name="contribution_amount"
                        className="form-control"
                        value={editedChit?.contribution_amount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Auction Type</label>
                      <select
                        name="auction_type"
                        className="form-control"
                        value={editedChit?.auction_type}
                        onChange={handleInputChange}
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <input
                        type="text"
                        name="status"
                        className="form-control"
                        value={editedChit?.status}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Created At</label>
                      <input
                        type="text"
                        name="created_at"
                        className="form-control"
                        value={editedChit?.created_at.split('T')[0]} 
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Updated At</label>
                      <input
                        type="text"
                        name="updated_at"
                        className="form-control"
                        value={editedChit?.updated_at.split('T')[0]} // Format date
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-outline-warning"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="row gx-4 gy-3">
                    <div className="col-md-6">
                      <p className="text-muted fs-6">Chit Name</p>
                      <p className="text fw-bold fs-3" 
                      style={{
                        color: "#004852"
                      }}>
                        {chit.chit_name}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted fs-6">Chit Type</p>
                      <p className="text fw-bold fs-3" style={{
                          color: "#004852"
                        }}>
                        {chit.chit_type}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted fs-6">Total Value</p>
                      <p className="text- fw-bold fs-3 " 
                      style={{
                        color: "#004852"
                      }}>
                        {chit.total_chit_value.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted">Contribution Amount</p>
                      <p className="text fw-bold fs-3" style={{
                          color: "#004852"
                        }}>
                        {chit.contribution_amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted">Number of Members</p>
                      <p
                        className="text fw-bold fs-3"
                        style={{
                          color: "#004852"
                        }}
                      >
                        {chit.number_of_members}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted">Commission Percentage</p>
                      <p className="text fw-bold  fs-3" 
                      style={{
                        color: "#004852"
                      }}>
                        {chit.commission_percentage}%
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted">Start Date</p>
                      <p className="text fw-bold  fs-3" style={{
                          color: "#004852"
                        }}>
                        {new Date(chit.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted">Duration</p>
                      <p className="text fw-bold  fs-3" 
                      style={{
                        color: "#004852"
                      }}>
                        {chit.duration} months
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted">Description</p>
                    <p>{chit.description}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted">Terms and Conditions</p>
                    <p>{chit.terms_and_conditions}</p>
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-warning"
                      onClick={handleEdit}
                    >
                      Edit Details
                    </button>
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => window.location.href = `/viewChit/singleChit/${chit.id}/addEntries`}
                    >
                      Add Entries
                    </button>
                  </div>
                  
                  {!isEditing && (
                    <div className="mt-4">
                      <h3>Entries</h3>
                      <table className="table">
                <thead>
                  <tr>
                    <th>Month Number</th>
                    <th>Bid Amount</th>
                    <th>Prize Amount</th>
                    <th>Premium</th>
                    <th>Dividend</th>
                    <th>Paid Amount</th>
                    <th>Select Status</th>
                    <th>Paid On</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      {entry.isEditing ? (
                        <>
                          <td><input value={entry.monthnumber} onChange={(e) => handleEntryChange(entry.id, "monthnumber", parseFloat(e.target.value))} /></td>
                          <td><input value={entry.bidamount} onChange={(e) => handleEntryChange(entry.id, "bidamount", parseFloat(e.target.value))} /></td>
                          <td><input value={entry.prizedamount} readOnly /></td>
                          <td><input value={entry.premium} readOnly /></td>
                          <td><input value={entry.dividend} readOnly /></td>
                          <td><input value={entry.amountPaid} onChange={(e) => handleEntryChange(entry.id, "amountPaid", parseFloat(e.target.value))} /></td>
                          <td>
                            <select value={entry.selectstatus} onChange={(e) => handleEntryChange(entry.id, "selectstatus", e.target.value)}>
                              <option value="Paid">Paid</option>
                              <option value="Partially Paid">Partially Paid</option>
                              <option value="Not Paid">Not Paid</option>
                            </select>
                          </td>
                          <td><input type="date" value={new Date(entry.paidon).toISOString().split("T")[0]} onChange={(e) => handleEntryChange(entry.id, "paidon", e.target.value)} /></td>
                              <td>
                                <FaSave onClick={() => handleSaveRow(entry)} style={{ cursor: "pointer", color: "green" }} />
                              </td>
                        </>
                      ) : (
                        <>
                          <td>{entry.monthnumber}</td>
                          <td>{entry.bidamount}</td>
                          <td>{entry.prizedamount}</td>
                          <td>{entry.premium}</td>
                          <td>{entry.dividend}</td>
                          <td>{entry.amountPaid}</td>
                          <td>{entry.selectstatus}</td>
                          <td>{new Date(entry.paidon).toLocaleDateString()}</td>
                          <td>
                            <FaEdit onClick={() => handleEditRow(entry.id)} style={{ cursor: "pointer", color: "blue" }} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
