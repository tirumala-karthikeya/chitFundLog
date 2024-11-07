'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter } from 'next/navigation';

interface ChitData {
  id: number;
  chit_name: string;
  contribution_amount: number;
  number_of_members: number;
  commission_percentage: string;
}

interface AddEntryForm {
  chit_id: number;
  monthnumber: number;
  bidamount: number;
  prizedamount: number;
  premium: number;
  dividend: number;
  paidamount: number;
  selectstatus: string;
  paidon: string;
  amountPaid: number;
}

const AddEntriesForm = ({ params }: { params: Promise<{ chitId: string }> }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [chitData, setChitData] = useState<ChitData | null>(null);
  
  const unwrappedParams = React.use(params);
  const chitId = parseInt(unwrappedParams.chitId);

  const [form, setForm] = useState<AddEntryForm>({
    chit_id: chitId,
    monthnumber: 0,
    bidamount: 0,
    prizedamount: 0,
    premium: 0,
    dividend: 0,
    paidamount: 0,
    selectstatus: '',
    paidon: new Date().toISOString().split('T')[0],
    amountPaid: 0
  });

  // Fetch chit data
  useEffect(() => {
    const fetchChitData = async () => {
      try {
        const { data, error } = await supabase
          .from('chits')
          .select('*')
          .eq('id', chitId)
          .single();

        if (error) throw error;
        setChitData(data);
      } catch (err) {
        setError('Failed to fetch chit data');
      }
    };

    fetchChitData();
  }, [chitId]);

  // Calculate values based on chit data
  useEffect(() => {
    if (!chitData) return;

    const totalChitAmount = chitData.number_of_members * chitData.contribution_amount;
    const monthlyPremium = chitData.contribution_amount;

    let commissionAmount = 0;
    if (chitData.chit_name !== 'Owner Chit') {
      commissionAmount = totalChitAmount * (parseFloat(chitData.commission_percentage) / 100);
    }

    const netDividend = (form.bidamount - commissionAmount)/ chitData.number_of_members;
    const prizedAmount = totalChitAmount - (form.bidamount);

    setForm(prev => ({
      ...prev,
      premium: monthlyPremium,
      dividend: netDividend,
      paidamount: monthlyPremium - netDividend,
      prizedamount: prizedAmount
    }));
  }, [chitData, form.bidamount]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value)
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      selectstatus: e.target.value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      paidon: e.target.value
    }));
  };

  const validateForm = () => {
    if (!chitData) return "Chit data not loaded";
    if (!form.chit_id) return "Chit ID is required";
    if (form.monthnumber <= 0 || form.monthnumber > chitData.number_of_members) 
      return `Month number must be between 1 and ${chitData.number_of_members}`;
    if (form.bidamount < 0) return "Bid amount cannot be negative";
    if (!form.selectstatus) return "Please select a status";
    if (!form.paidon) return "Please select a paid date";
    return null;
  };

  const handleSaveChanges = async () => {
    setError(null);
    setSuccess(false);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
          .from('addentries')
          .insert([{
            chit_id: form.chit_id,
            monthnumber: form.monthnumber,
            bidamount: form.bidamount,
            prizedamount: form.prizedamount,
            premium: form.premium,
            dividend: form.dividend,
            paidamount: form.paidamount,
            selectstatus: form.selectstatus,
            paidon: form.paidon,
            amountPaid: form.amountPaid
          }]);

        if (error) {
          console.error('Supabase Error:', error.message);
          console.log('Error details:', error);
          throw error; // Optional, depending on your flow
        } else {
          console.log('Data inserted:', data);
        }


      setSuccess(true);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  if (!chitData) {
    return <div className="card mx-auto" style={{ maxWidth: '800px' }}>Loading chit data...</div>;
  }

  return (
    <div className="card mx-auto" style={{ maxWidth: '800px' }}>
      <div className="card-header">
        <h5 className="card-title mb-0">Add New Entry - {chitData.chit_name}</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            Entry saved successfully!
          </div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="monthnumber" className="form-label">Month Number</label>
            <input
              id="monthnumber"
              type="number"
              className="form-control"
              name="monthnumber"
              min="1"
              max={chitData.number_of_members}
              value={form.monthnumber || ''}
              onChange={handleNumberChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="bidamount" className="form-label">Bid Amount</label>
            <input
              id="bidamount"
              type="number"
              className="form-control"
              name="bidamount"
              value={form.bidamount || ''}
              onChange={handleNumberChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="premium" className="form-label">Premium</label>
            <input
              id="premium"
              type="number"
              className="form-control"
              name="premium"
              value={form.premium || ''}
              onChange={handleNumberChange}
              readOnly
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="dividend" className="form-label">Dividend</label>
            <input
              id="dividend"
              type="number"
              className="form-control"
              name="dividend"
              value={form.dividend || ''}
              onChange={handleNumberChange}
              readOnly
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="paidamount" className="form-label">Amount to be Paid</label>
            <input
              id="paidamount"
              type="number"
              className="form-control"
              name="paidamount"
              value={form.paidamount || ''}
              onChange={handleNumberChange}
              readOnly
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="selectstatus" className="form-label">Status</label>
            <select 
              id="selectstatus"
              className="form-select"
              value={form.selectstatus}
              onChange={handleStatusChange}
            >
              <option value="">Select Status</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Not Paid">Not Paid</option>
              <option value="Won">Won</option>
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="paidon" className="form-label">Paid On</label>
            <input
              id="paidon"
              type="date"
              className="form-control"
              name="paidon"
              value={form.paidon}
              onChange={handleDateChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="amountPaid" className="form-label">Amount Paid</label>
            <input
              id="amountPaid"
              type="number"
              className="form-control"
              name="amountPaid"
              value={form.amountPaid || ''}
              onChange={handleNumberChange}
            />
          </div>
        </div>
      </div>
      
      <div className="card-footer text-end">
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="button"
          className="btn btn-primary"
          onClick={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

export default AddEntriesForm;