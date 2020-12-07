using Healthcare.DataAccess.Data;
using Healthcare.DataAccess.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Healthcare.DataAccess.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        private readonly DbContext _dbContext;
        protected DbSet<T> DbSet;
        public BaseRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
            DbSet = _dbContext.Set<T>();
        }
        public T Add(T entity)
        {
            _dbContext.Set<T>().Add(entity);
            int result = Save();
            if (result > 0)
                return entity;
            else
                return null;
        }

        public void Delete(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Deleted;
            Save();
        }

        public T Get<Tkey>(T id)
        {
            return DbSet.Find(id);
        }

        public IQueryable<T> GetAll()
        {
            return DbSet;
        }

        public List<T> GetAll(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Where(whereCondition).ToList<T>();
        }

        public T GetSingle(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Where(whereCondition).FirstOrDefault<T>();
        }

        public void Update(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            Save();
        }
        private int Save()
        {
            int result = _dbContext.SaveChanges();
            return result;
        }

        public async Task<T> AddAsync(T entity)
        {
            _dbContext.Set<T>().Add(entity);
            int result = await SaveAsync();
            if (result > 0)
                return entity;
            else
                return null;
        }

        public async Task UpdateAsync(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            await SaveAsync();
        }

        private async Task<int> SaveAsync()
        {
            int result = await _dbContext.SaveChangesAsync();
            return result;
        }
    }
}
