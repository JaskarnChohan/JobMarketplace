import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch company profiles
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('/api/company-profiles');
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching company profiles:", error);
      }
    };
    fetchCompanies();
  }, []);

  // Handle search
  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="company-profile-page">
      <header>
        <div className="navbar">
          <div className="logo">Company Profiles</div>
        </div>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by company name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button>Search</button>
      </div>

      <section className="companies">
        <h2>Explore Companies</h2>
        <div className="company-list">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div className="company-card" key={company._id}>
                <h3>{company.companyName}</h3>
                <span>{company.industry}</span>
                <p>{company.location}</p>
                <a href={company.websiteURL} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            ))
          ) : (
            <p>No companies found</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompanyProfile;
