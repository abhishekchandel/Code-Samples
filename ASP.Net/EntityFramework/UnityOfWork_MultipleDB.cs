using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Transactions;

namespace Pool.Data
{
   public class UnityOfWork:IDisposable
    {

        private SqlHeritageContext _dbHeritageContext;
        private SqlPaymentInfoContext  _dbPaymentContext;
        private SqlPeopleContext  _dbPeopleContext;
        private SqlPeopleLiveContext  _dbPeopleLiveContext;
        private SqlReportContext  _dbReportContext;
        private SqlSiteInfoContext _dbSiteInfoContext;
        private SqlSSDIContext _dbSSDIContext;
        private SqlImageClippingContext _dbImageClippingContext;
        private SqlPersonContext _dbPersonContext;
     
        

          Pool.Core.Configuration.NAConfiguration _config = new Na.Core.Configuration.NAConfiguration();
          
           

        public SqlHeritageContext  HeritageContext { 
            get {
                if (_dbHeritageContext == null)
                {                   
                     
                _dbHeritageContext=new SqlHeritageContext(_config.GetConnectionStringFromConfig("HeritageConnectionString", ""));
                }
                return _dbHeritageContext; } 
        
        }
        public SqlPaymentInfoContext PaymentContext
        {
            get {
                if (_dbPaymentContext == null)
                {                  
                    _dbPaymentContext=new SqlPaymentInfoContext(_config.GetConnectionStringFromConfig("PaymentConnectionString", ""));
                }
                return _dbPaymentContext; }
        }

        public SqlPeopleContext  PeopleContext {
            get {
                if (_dbPeopleContext == null)
                {                    
                    _dbPeopleContext=new SqlPeopleContext( _config.GetConnectionStringFromConfig("PeopleConnectionString", ""));

                }
                return _dbPeopleContext;
                } }

        public SqlPeopleLiveContext  PeopleLiveContext {
            get {
                if (_dbPeopleLiveContext == null)
                {                 
                    _dbPeopleLiveContext=new SqlPeopleLiveContext(_config.GetConnectionStringFromConfig("PeopleConnectionString", ""));
                }
                return _dbPeopleLiveContext; } }
        public SqlReportContext  ReportContext { 
            get { 
                if(_dbReportContext==null)
                {                   
                    _dbReportContext =new SqlReportContext( _config.GetConnectionStringFromConfig("ReportConnectionString", ""));
                }
                return _dbReportContext; } }
        public SqlSiteInfoContext  SiteInfoContext { 
             get {
                 if (_dbSiteInfoContext == null)
                 {                    
                     _dbSiteInfoContext=new SqlSiteInfoContext( _config.GetConnectionStringFromConfig("SiteConnectionString", ""));
                }
                 return _dbSiteInfoContext; } 
        }

        public SqlSSDIContext SSDIContext
        {
            get{
                if (_dbSSDIContext == null)
                {

                    _dbSSDIContext = new SqlSSDIContext(_config.GetConnectionStringFromConfig("SSDIConnectionString", ""));
                }
                return _dbSSDIContext;
            }

        }

        public SqlImageClippingContext ImageClippingContext
        {
            get
            {
                if (_dbImageClippingContext == null)
                {
                    _dbImageClippingContext = new SqlImageClippingContext(_config.GetConnectionStringFromConfig("ImageConnectionString", ""));
                }
                return _dbImageClippingContext;
            }
        }


       //TODO:Add New Contex for Person
        public SqlPersonContext PersonContext
        {
            get
            {
                if (_dbPersonContext == null)
                {                   
                    _dbPersonContext = new SqlPersonContext(_config.GetConnectionStringFromConfig("PersonConnectionString", ""));
                }
                return _dbPersonContext;
            }
        }




        public UnityOfWork()
        {
        
        }

        public void Commit()
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.Required,
                                               new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted }))
                {
                    if(_dbHeritageContext!=null)
                    _dbHeritageContext.SaveChanges();

                    if(_dbPaymentContext!=null)
                    _dbPaymentContext.SaveChanges();
                    
                    if(_dbPeopleContext!=null)
                    _dbPeopleContext.SaveChanges();

                    if(_dbPeopleLiveContext!=null)
                    _dbPeopleLiveContext.SaveChanges();

                    if(_dbReportContext!=null)
                    _dbReportContext.SaveChanges();

                    if(_dbSiteInfoContext!=null)
                    _dbSiteInfoContext.SaveChanges();

                    if (_dbSSDIContext != null)
                        _dbSSDIContext.SaveChanges();

                    if (_dbImageClippingContext != null)
                        _dbImageClippingContext.SaveChanges();

                    if (_dbPersonContext != null)
                        _dbPersonContext.SaveChanges();

                    scope.Complete();
                }
            }

            catch (Exception ex)
            {
                throw new Exception("Exception", ex);
           }
            
        }

        public void Dispose()
        {
            _dbHeritageContext.Dispose ();
            _dbPaymentContext.Dispose();
            _dbPeopleContext.Dispose();
            _dbPeopleLiveContext.Dispose();
            _dbReportContext.Dispose();
            _dbSiteInfoContext.Dispose();
            _dbSSDIContext.Dispose();
            _dbImageClippingContext.Dispose();
            _dbPersonContext.Dispose();          
        }
    }
}

