using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data.Entity;
using System.Data.Entity.Design.PluralizationServices;
using System.Data.Entity.Infrastructure;
using System.Dynamic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.Remoting.Contexts;
using Beesightsoft.Core.Converters;
using Beesightsoft.Core.Extensions;
using Beesightsoft.Core.Models;
using Beesightsoft.Web.Nancy.Exceptions;
using Beesightsoft.Web.Nancy.Infrastructure;
using Beesightsoft.Web.Nancy.Services;
using Fasterflect;
using LinqKit;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Nancy;
using Nancy.Extensions;
using Nancy.ModelBinding;
using Nancy.Owin;
using Nancy.Security;
using Newtonsoft.Json;
using Microsoft.AspNet.Identity;
using Beesightsoft.Web.Nancy.Extensions;
using NewMedical.Core.Models;

namespace Beesightsoft.Web.Nancy.Modules
{
    public abstract class CrudModule<TDataContext, TEntity, TAddOrUpdateDto> : NancyModule
        where TDataContext : DbContext, new()
        where TEntity : EntityBase
    {
      
        #region Build Route Resource
        protected virtual string BuildRouteResource()
        {
            var currentTypeName = typeof(TEntity).Name;

            var pluralService = PluralizationService.CreateService(new CultureInfo("en-US"));
            var routeResouce = pluralService.Pluralize(currentTypeName).ToLower();

            return routeResouce;
        }
        #endregion

       
      

        #region OwinContext
        private OwinContext mOwinContext;
        protected OwinContext OwinContext
        {
            get
            {
                if (mOwinContext == null)
                {
                    mOwinContext = new Microsoft.Owin.OwinContext(Context.GetOwinEnvironment());
                }

                return mOwinContext;
            }
        }
        #endregion

        #region From Entities
        protected virtual IList<dynamic> FromEntities(IList<TEntity> entities, string[] contexts = null, string[] fields = null)
        {
            var dtos = new List<dynamic>();

            foreach (var entity in entities)
            {
                dtos.Add(FromEntity(entity, contexts, fields));
            }

            return dtos;
        }
        #endregion

        #region From Entity
        protected virtual dynamic FromEntity(TEntity entity, string[] contexts = null, string[] fields = null)
        {
            return EntityConverter.FromEntity(entity, contexts, fields);
        }
        #endregion

        #region From Add Dto
        protected virtual TEntity FromAddOrUpdateDto(TAddOrUpdateDto dto)
        {
            var dictionary = (IDictionary<string, object>)dto;
            var entityType = typeof(TEntity);

            for(int i=0;i<dictionary.Count;i++)
            {
                var pair = dictionary.ElementAt(i);
                if (pair.Value is List<dynamic>)
                {
                    var propertyName = pair.Key;
                    var propertyInfo = entityType.GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    var propertyType = propertyInfo.PropertyType;

                    var types =
                        propertyType.GetInterfaces()
                            .Where(x => x.IsGenericType && x.GetGenericTypeDefinition() == typeof (IEnumerable<>)).ToArray();
                    var innerGenericType = types[0].GetGenericArguments()[0];

                    var propertyValues = pair.Value as List<dynamic>;
                    var collection = (IList)propertyType.CreateInstance();
                    foreach (var propertyValue in propertyValues)
                    {
                        if (propertyValue is ExpandoObject)
                        {
                            var obj = Slapper.AutoMapper.MapDynamic(innerGenericType, propertyValue);
                            collection.Add(obj);
                        }
                        else
                        {
                            collection.Add(propertyValue);
                        }
                    }
                    dictionary[propertyName] = collection;
                }
                else if (pair.Value is ExpandoObject)
                {
                    var propertyName = pair.Key;
                    var propertyValue = pair.Value;
                    var propertyInfo = entityType.GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    var obj = Slapper.AutoMapper.MapDynamic(propertyInfo.PropertyType, propertyValue);
                    dictionary[propertyName] = obj;
                }
            }
            
            var entity = mMapperService.MapDynamic<TEntity>(dto);
            return entity;
        }
        #endregion

        #region Get All
        protected virtual Response DoGetAll(dynamic parameters, Expression<Func<TEntity, bool>> predicate = null)
        {
            IList<dynamic> dtos;

            var context = this.OwinContext.Get<TDataContext>();
            

            #region Filter & X-Filter
            IQueryable<TEntity> query = GetFilterList(OnBuildQueryForAll(context), predicate);

            var filterString = this.Request.Headers["X-Filter"].FirstOrDefault();
            if (!string.IsNullOrEmpty(filterString))
            {
                IList<FilterCriteria> filters = null;

                try
                {
                    filters = JsonConvert.DeserializeObject<IList<FilterCriteria>>(filterString);

                    if (filters.Any())
                    {
                        var filterPredicate = PredicateBuilder.False<TEntity>();

                        var entityType = typeof(TEntity);

                        foreach (var filter in filters)
                        {
                            Type valueType = filter.Value == null ? null : filter.Value.GetType();

                            var propertyInfo = entityType.GetProperty(filter.Property, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                            if (propertyInfo == null)
                            {
                                return this.AsFailedResponse(string.Format("Error while interpreting X-Filter: Property {0} not found", filter.Property), HttpStatusCode.BadRequest);
                            }

                            var dbTypeParameter = Expression.Parameter(entityType, @"x");
                            var dbFieldMember = Expression.MakeMemberAccess(dbTypeParameter, propertyInfo);

                            Expression criterionConstant = null;

                            if (valueType == null)
                            {
                                criterionConstant = Expression.Constant(null);
                            }
                            else
                            {
                                if (propertyInfo.PropertyType == valueType)
                                {
                                    criterionConstant = Expression.Constant(filter.Value);
                                }
                                else
                                {
                                    var propertyType = Nullable.GetUnderlyingType(propertyInfo.PropertyType) ?? propertyInfo.PropertyType;

                                    if (propertyType == typeof(Guid))
                                    {
                                        criterionConstant = Expression.Convert(Expression.Constant(new Guid(filter.Value.ToString())), propertyInfo.PropertyType);
                                    }
                                    else
                                    {
                                        criterionConstant = Expression.Convert(Expression.Constant(filter.Value), propertyInfo.PropertyType);
                                    }
                                }
                            }

                            Expression equals = Expression.Equal(dbFieldMember, criterionConstant);

                            var lambda = Expression.Lambda(equals, dbTypeParameter) as Expression<Func<TEntity, bool>>;

                            if (filter.Condition.Equals("and", StringComparison.OrdinalIgnoreCase))
                            {
                                filterPredicate = filterPredicate.And(lambda);
                            }
                            else if (filter.Condition.Equals("or", StringComparison.OrdinalIgnoreCase))
                            {
                                filterPredicate = filterPredicate.Or(lambda);
                            }
                            else
                            {
                                return this.AsFailedResponse(new NotImplementedException("Error while interpreting X-Filter: previous should only be and/or"), HttpStatusCode.BadRequest);
                            }
                        }

                        query = query.Where(filterPredicate.Expand());
                    }
                    else
                    {

                    }
                }
                catch (Exception ex)
                {
                    return this.AsFailedResponse(ex, HttpStatusCode.BadRequest);
                }
            }
            #endregion

            #region Sort And Paging
            long totalCount = -1;
            IList<TEntity> entities = ApplySortAndPaging(query, ref totalCount);
            #endregion

            #region Embed
            string[] contexts = this.BuildEmbedContext();
            string[] fields = this.BuildFieldsContext();

            dtos = FromEntities(entities, contexts, fields);
            #endregion

            return totalCount == -1 ? this.AsSuccessResponse((object)dtos) : this.AsSuccessResponse((object)dtos, totalCount);
        }
        #endregion

        #region Apply Sort And Paging
        protected virtual IList<TEntity> ApplySortAndPaging(IQueryable<TEntity> query, ref long totalCount)
        {
            Tuple<string, bool>[] sortContext = null;

            string sort = this.Request.Query.sort;
            if (!string.IsNullOrEmpty(sort))
            {
                var sortStrs = sort.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                sortContext = new Tuple<string, bool>[sortStrs.Length];

                for (int i = 0; i < sortStrs.Length; i++)
                {
                    var sortStr = sortStrs[i].Trim();

                    var isAscending = !sortStr.StartsWith("-");
                    var sortProperty = isAscending ? sortStr : sortStr.Substring(1);

                    sortContext[i] = new Tuple<string, bool>(sortProperty, isAscending);
                }
            }

            IOrderedQueryable<TEntity> orderedQuery = null;
            if (sortContext != null)
            {
                for (int i = 0; i < sortContext.Length; i++)
                {
                    var sortTask = sortContext[i];

                    if (i == 0)
                    {
                        orderedQuery = OrderBySingleClause(query, sortTask.Item1, sortTask.Item2);
                    }
                    else
                    {
                        orderedQuery = OrderThenBySingleClause(orderedQuery, sortTask.Item1, sortTask.Item2);
                    }
                }
            }
            else
            {
                orderedQuery = query.OrderBy(entity => entity.CreatedDate);
            }

            IList<TEntity> entities = null;
            #region Paging
            string page = this.Request.Query.page;
            if (!string.IsNullOrEmpty(page))
            {
                int pageIndex = this.Request.Query.page - 1;

                string pageSizeStr = this.Request.Query.pageSize;
                int pageSize = string.IsNullOrEmpty(pageSizeStr) ? Configuration.PageSize : Request.Query.pageSize;

                entities = orderedQuery.Skip(pageSize * pageIndex).Take(pageSize).ToList();
                totalCount = query.Count();
            }
            else
            {
                entities = orderedQuery.ToList();
            }
            #endregion

            return entities;
        }
        #endregion

        protected virtual IOrderedQueryable<TEntity> OrderBySingleClause(IQueryable<TEntity> query, string sortClauseName, bool isAscending)
        {
            return query.OrderBy(sortClauseName, isAscending);
        }

        protected virtual IOrderedQueryable<TEntity> OrderThenBySingleClause(IOrderedQueryable<TEntity> query, string sortClauseName, bool isAscending)
        {
            return query.ThenBy(sortClauseName, isAscending);
        }

        protected IQueryable<K> GetFilterList<K>(IQueryable<K> entities, Expression<Func<K, bool>> expression = null) where K : IEntity
        {
            string keyword = this.Request.Query.q;
            if (!string.IsNullOrEmpty(keyword))
            {
                var keywordPredicate = PredicateBuilder.False<K>();

                Type entityType = typeof(K);
                IEnumerable<PropertyInfo> properties;

                if (keyword.Contains("="))
                {
                    string[] pairs = keyword.Split(new string[] { "=" }, StringSplitOptions.RemoveEmptyEntries);

                    if (pairs.Length > 2)
                    {
                        properties = entityType.GetProperties().Where(property => property.PropertyType == typeof(string));
                    }
                    else
                    {
                        string[] propertyNames = pairs[0].Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries).Select(propertyName => propertyName.ToLower()).ToArray();
                        keyword = pairs[1];

                        //properties = entityType.GetProperties().Where(property => property.PropertyType == typeof(string) && propertyNames.Contains(property.Name.ToLower()));
                        properties = entityType.GetProperties().Where(property => propertyNames.Contains(property.Name.ToLower()));
                    }
                }
                else
                {
                    properties = entityType.GetProperties().Where(property => property.PropertyType == typeof(string));
                }

                foreach (var property in properties)
                {
                    var dbTypeParameter = Expression.Parameter(entityType, @"x");
                    var dbFieldMember = Expression.MakeMemberAccess(dbTypeParameter, property);
                    var criterionConstant = new Expression[] { Expression.Constant(keyword) };
                    var containsCall = Expression.Call(dbFieldMember, StringContainsMethod, criterionConstant);
                    var lambda = Expression.Lambda(containsCall, dbTypeParameter) as Expression<Func<K, bool>>;
                    keywordPredicate = keywordPredicate.Or(lambda);

                   
                }

                if (expression == null)
                {
                    return entities.Where(keywordPredicate.Expand());
                }
                else
                {
                    var predicate = keywordPredicate.And(expression.Expand());
                    return entities.Where(predicate.Expand());
                }
            }
            else
            {
                return expression == null ? entities : entities.Where(PredicateBuilder.True<K>().And(expression.Expand()).Expand());
            }
        }
        protected IQueryable<K> GetPagingList<K>(IOrderedQueryable<K> entities) where K : IEntity
        {
            string page = this.Request.Query.page;
            if (!string.IsNullOrEmpty(page))
            {
                int pageIndex = this.Request.Query.page - 1;

                string pageSizeStr = this.Request.Query.pageSize;
                int pageSize = string.IsNullOrEmpty(pageSizeStr) ? Configuration.PageSize : Request.Query.pageSize;

                return entities.Skip(pageSize * pageIndex).Take(pageSize);
            }
            else
            {
                return entities;
            }
        }

        #region On Build Query
        protected virtual IQueryable<TEntity> OnBuildQueryForAll(TDataContext context, Expression<Func<TEntity, bool>> predicate = null)
        {
            IQueryable<TEntity> query = predicate == null ? context.Set<TEntity>() : context.Set<TEntity>().AsExpandable().Where(predicate);

            return query;
        }
        #endregion

        #region Do Get
        protected virtual Response DoGet(dynamic parameters)
        {
            Guid id = parameters.id;

            using (var context = new TDataContext())
            {
                var entity = context.Set<TEntity>().Find(id);

                if (entity == null)
                {
                    return this.AsFailedResponse(string.Format(Beesightsoft.Web.Nancy.Infrastructure.Constants.STRING_FORMAT_FOR_NOT_ENTITY_NOT_FOUND, id), HttpStatusCode.NotFound);
                }

                string[] contexts = this.BuildEmbedContext();

                var dto = FromEntity(entity, contexts);

                #region Audit
                if (Request.Headers["screenName"].ElementAtOrDefault(0) != null)
                {
                    string tableName = context.GetTableName<TEntity>();
                    string identityUserID = Context.GetMSOwinUser().Identity.GetUserId();
                    List<AuditLog> auditLogs = new List<AuditLog>();
                    List<string> columnNames = AuditLogService.AuditableColumns(tableName);

                    if (columnNames.Count > 0)
                    {
                        AuditLog log = new AuditLog()
                        {
                            Id = Guid.NewGuid(),
                            OperationType = "VIEW",
                            TableName = tableName,
                            PrimaryKey = id.ToString(),
                            FieldName = string.Empty,
                            NewValue = string.Empty,
                            UserID = Guid.Parse(identityUserID),
                            IsDeleted = false,
                            IsLuminX = false,
                            ScreenName = Request.Headers["screenName"].ElementAtOrDefault(0),
                            UserIPAddress = Request.UserHostAddress
                        };

                        auditLogs.Add(log);
                    }

                    AuditLogService.LogActivityIntoDB(context, auditLogs);
                    context.SaveChanges();
                }
                #endregion

                return this.AsSuccessResponse((object)dto);
            }
        }
        #endregion

        #region Do Add
        protected virtual Response DoAdd(dynamic parameters)
        {
            Response response = null;

            TAddOrUpdateDto dto;
            TEntity entity;

            try
            {
                dto = this.Bind<TAddOrUpdateDto>();
                entity = FromAddOrUpdateDto(dto);
            }
            catch (Exception ex)
            {
                return this.AsFailedResponse(ex, HttpStatusCode.BadRequest);
            }

            var dataContext = this.OwinContext.Get<TDataContext>();
            using (var transaction = dataContext.Database.BeginTransaction())
            {
                try
                {
                    OnAdd(dataContext, entity, dto);
                    transaction.Commit();

                    response = this.AsSuccessResponse((object)FromEntity(entity), HttpStatusCode.Created);
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    response = this.AsFailedResponse(ex);
                }
            }

            return response;
        }
        #endregion

        #region OnAdd
        protected virtual void OnAdd(DbContext context, TEntity entity, TAddOrUpdateDto dto)
        {
            context.Set<TEntity>().Add(entity);

            #region Audit
            string tableName = context.GetTableName<TEntity>();

            List<string> columnNames = AuditLogService.AuditableColumns(tableName);

            if (columnNames.Count > 0)
            {
                var dictionary = dto as IDictionary<string, object>;
                string identityUserID = Context.GetMSOwinUser().Identity.GetUserId();
                List<AuditLog> auditLogs = new List<AuditLog>();

                List<string> serializableTypeNames = dto.GetType().GetProperties().Where(q => q.PropertyType.BaseType.Name.Contains("EntitySerializable")).Select(data => data.PropertyType.Name).ToList();
                    
                foreach (var item in dictionary)
                {
                    if ((columnNames.Contains(item.Key.ToPascalCase())) && (item.Value != null) && (!string.IsNullOrEmpty(item.Value.ToString())))
                    {
                        AuditLog log = new AuditLog()
                        {
                            Id = Guid.NewGuid(),
                            OperationType = "CREATE",
                            TableName = tableName,
                            PrimaryKey = entity.Id.ToString(),
                            FieldName = ((item.Value.GetType().BaseType.Name.Contains("EntitySerializable")) 
                                            ? (item.Key.ToPascalCase() + "Serialized")
                                            : item.Key.ToPascalCase()),
                            NewValue = ((item.Value.GetType().BaseType.Name.Contains("EntitySerializable")) 
                                            ? item.Value.GetType().GetProperty("Serialized").GetValue(item.Value, null).ToString() 
                                            : item.Value.ToString()),
                            UserID = Guid.Parse(identityUserID),
                            IsDeleted = false,
                            IsLuminX = false,
                            ScreenName = Request.Headers["screenName"].ElementAtOrDefault(0),
                            UserIPAddress = Request.UserHostAddress
                        };

                        auditLogs.Add(log);
                    }
                }

                AuditLogService.LogActivityIntoDB(context, auditLogs);
            }
            #endregion

            context.SaveChanges();
        }
        #endregion

        #region Do Update
        protected virtual Response DoUpdate(dynamic parameters)
        {
            Response response = null;

            Guid id;
            TAddOrUpdateDto dto;
            TEntity newEntity;

            try
            {
                id = parameters.id;
                dto = this.Bind<TAddOrUpdateDto>();
                newEntity = FromAddOrUpdateDto(dto);
                newEntity.Id = id;
            }
            catch (Exception ex)
            {
                return this.AsFailedResponse(ex, HttpStatusCode.BadRequest);
            }

            using (var context = new TDataContext())
            {
                using (var transaction = context.Database.BeginTransaction())
                {
                    try
                    {
                        var oldEntity = context.Set<TEntity>().Find(id);
                        if (oldEntity == null)
                        {
                            return this.AsFailedResponse(Beesightsoft.Web.Nancy.Infrastructure.Constants.STRING_FORMAT_FOR_NOT_ENTITY_NOT_FOUND, HttpStatusCode.NotFound);
                        }

                        OnUpdate(context, oldEntity, newEntity, dto);
                        transaction.Commit();

                        response = this.AsSuccessResponse((object)FromEntity(oldEntity), HttpStatusCode.OK);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        response = this.AsFailedResponse(ex);
                    }
                }
            }

            return response;
        }
        #endregion

        #region On Update
        protected virtual void OnUpdate(TDataContext context, TEntity oldEntity, TEntity newEntity, TAddOrUpdateDto dto)
        {
            var entry = context.Entry(oldEntity);
            entry.CurrentValues.SetValues(newEntity);           
            context.SaveChanges();
        }
        #endregion

     

        #region Do Update Partial
        protected virtual void SetPropertyForUpdatePartial(string propertyName, object propertyValue, TEntity entity, Type objectType, DbEntityEntry<TEntity> entry)
        {
            DbPropertyEntry entryProperty = null;
            try
            {
                entryProperty = entry.Property(propertyName);
            }
            catch
            {
                var propertyInfo = objectType.GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                entryProperty = entry.Property(propertyInfo.Name);
            }

            try
            {
                entryProperty.CurrentValue = propertyValue;
            }
            catch
            {
                var propertyInfo = objectType.GetProperty(propertyName);
                
                var propertyType = Nullable.GetUnderlyingType(propertyInfo.PropertyType) ?? propertyInfo.PropertyType;
                
                if (propertyType.IsEnum)
                {
                    entryProperty.CurrentValue = Enum.Parse(propertyType, propertyValue.ToString());
                }
               
                else
                {
                  
                    if (propertyType == typeof(Guid))
                    {
                        entryProperty.CurrentValue = TypeDescriptor.GetConverter(propertyType).ConvertFrom(propertyValue);
                    }
                    else if (propertyType.IsSubclassOfRawGeneric(typeof (EntitySerializableCollection<>)))
                    {
                        var types =
                        propertyType.GetInterfaces()
                            .Where(x => x.IsGenericType && x.GetGenericTypeDefinition() == typeof(IEnumerable<>)).ToArray();
                        var innerGenericType = types[0].GetGenericArguments()[0];

                        var propertyValues = propertyValue as List<dynamic>;
                        var collection = (IList)propertyType.CreateInstance();
                        foreach (var childPropertyValue in propertyValues)
                        {
                            if (childPropertyValue is ExpandoObject)
                            {
                                var obj = Slapper.AutoMapper.MapDynamic(innerGenericType, childPropertyValue);
                                collection.Add(obj);
                            }
                            else
                            {
                                collection.Add(childPropertyValue);
                            }
                        }
                        entryProperty.CurrentValue = collection;
                    }
                    else if (propertyType.IsSubclassOf(typeof(EntitySerializable)))
                    {
                        EntitySerializable entityProperty = (EntitySerializable) Activator.CreateInstance(propertyType);
                        entityProperty.Serialized = JsonConvert.SerializeObject(propertyValue);
                        entryProperty.CurrentValue = entityProperty;
                    }                    
                    else
                    {
                        entryProperty.CurrentValue = Convert.ChangeType(propertyValue, propertyType);
                    }
                }
            }
        }

        protected virtual Response DoUpdatePartial(dynamic parameters)
        {
            Guid id;
            dynamic dto;

            try
            {
                id = parameters.id;
                dto = this.Bind<ExpandoObject>();
            }
            catch (Exception ex)
            {
                return this.AsFailedResponse(ex, HttpStatusCode.BadRequest);
            }

            using (var context = new TDataContext())
            {
                try
                {

                    var oldEntity = context.Set<TEntity>().Find(id);

                    string tableName = context.GetTableName<TEntity>();
                    var dictionary = dto as IDictionary<string, object>;
                    string identityUserID = Context.GetMSOwinUser().Identity.GetUserId();
                    List<AuditLog> auditLogs = new List<AuditLog>();
                    List<string> columnNames = AuditLogService.AuditableColumns(tableName);

                    if (oldEntity == null)
                    {
                        this.AsFailedResponse(Beesightsoft.Web.Nancy.Infrastructure.Constants.STRING_FORMAT_FOR_NOT_ENTITY_NOT_FOUND, HttpStatusCode.NotFound);
                    }

                    var objectType = typeof(TEntity);
                    var entry = context.Entry(oldEntity);
                    foreach (var property in (dto as IDictionary<string, object>))
                    {
                        var propertyName = property.Key.ToPascalCase();
                        var propertyValue = property.Value;

                        try
                        {
                            SetPropertyForUpdatePartial(propertyName, propertyValue, oldEntity, objectType, entry);

                            if (columnNames.Count > 0)
                            {
                                DbPropertyEntry entryProperty = entry.Property(propertyName);

                                if (((columnNames.Contains(property.Key.ToPascalCase())) || (property.Key.ToPascalCase().Equals("IsDeleted"))) && (property.Value != null) && (!string.IsNullOrEmpty(property.Value.ToString())) && (((entryProperty.OriginalValue != null) && (!entryProperty.OriginalValue.Equals(entryProperty.CurrentValue))) || (entryProperty.OriginalValue == null)))
                                {
                                    AuditLog log = new AuditLog()
                                    {
                                        Id = Guid.NewGuid(),
                                        OperationType = "UPDATE",
                                        TableName = tableName,
                                        PrimaryKey = id.ToString(),
                                        //FieldName = property.Key.ToPascalCase(),
                                        //NewValue = property.Value.ToString(),
                                        FieldName = ((entryProperty.CurrentValue.GetType().BaseType.Name.Contains("EntitySerializable")) 
                                            ? (property.Key.ToPascalCase() + "Serialized")
                                            : property.Key.ToPascalCase()),
                                        NewValue = ((entryProperty.CurrentValue.GetType().BaseType.Name.Contains("EntitySerializable")) 
                                            ? entryProperty.CurrentValue.GetType().GetProperty("Serialized").GetValue(entryProperty.CurrentValue, null).ToString() 
                                            : entryProperty.CurrentValue.ToString()),
                                        OldValue = ((entryProperty.OriginalValue != null)
                                                    ? ((entryProperty.OriginalValue.GetType().BaseType.Name.Contains("EntitySerializable"))
                                                        ? entryProperty.OriginalValue.GetType().GetProperty("Serialized").GetValue(entryProperty.OriginalValue, null).ToString()
                                                        : entryProperty.OriginalValue.ToString())
                                                    : null),
                                        UserID = Guid.Parse(identityUserID),
                                        IsDeleted = false,
                                        IsLuminX = false,
                                        ScreenName = Request.Headers["screenName"].ElementAtOrDefault(0),
                                        UserIPAddress = Request.UserHostAddress
                                    };

                                    auditLogs.Add(log);
                                }
                            }
                        }
                        catch (HttpServerException ex)
                        {
                            return this.AsFailedResponse(ex);
                        }
                        catch (Exception ex)
                        {
                            throw new Exception(string.Format("Error while update property {0} with {1} of type {2}\nInner exception: {3}", propertyName, propertyValue, objectType.Name, ex.Message));
                        }
                    }

                    AuditLogService.LogActivityIntoDB(context, auditLogs);

                    context.SaveChanges();
                    return this.AsSuccessResponse((object)FromEntity(oldEntity), HttpStatusCode.OK);
                }
                catch (Exception ex)
                {
                    return this.AsFailedResponse(ex);
                }
            }
        }

        
        #endregion

        #region Do Delete
        protected virtual Response DoDelete(dynamic parameters)
        {
            Response response = null;
            Guid id = parameters.id;

            var owinContext = new Microsoft.Owin.OwinContext(Context.GetOwinEnvironment());
            var context = owinContext.Get<TDataContext>();

            var entity = context.Set<TEntity>().Find(id);
            if (entity == null)
            {
                return this.AsFailedResponse(string.Format(Infrastructure.Constants.STRING_FORMAT_FOR_NOT_ENTITY_NOT_FOUND, id), HttpStatusCode.NotFound);
            }

            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    OnDelete(context, entity);
                    transaction.Commit();

                    response = this.AsSuccessResponse();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    response = this.AsFailedResponse(ex);
                }
            }

            return response;
        }
        #endregion

        #region On Delete
        protected virtual void OnDelete(DbContext context, TEntity entity)
        {
            context.Set<TEntity>().Remove(entity);
            
            #region Audit
            string tableName = context.GetTableName<TEntity>();
            List<string> columnNames = AuditLogService.AuditableColumns(tableName);

            if (columnNames.Count > 0)
            {
                
                string identityUserID = Context.GetMSOwinUser().Identity.GetUserId();
                List<AuditLog> auditLogs = new List<AuditLog>();

              
                    AuditLog log = new AuditLog()
                    {
                        Id = Guid.NewGuid(),
                        OperationType = "DELETE",
                        TableName = tableName,
                        PrimaryKey = entity.Id.ToString(),
                        FieldName = string.Empty,
                        NewValue = string.Empty,
                        UserID = Guid.Parse(identityUserID),
                        IsDeleted = false,
                        IsLuminX = false,
                        ScreenName = Request.Headers["screenName"].ElementAtOrDefault(0),
                        UserIPAddress = Request.UserHostAddress
                    };

                    auditLogs.Add(log);

                AuditLogService.LogActivityIntoDB(context, auditLogs);
            }
            #endregion

            context.SaveChanges();
        }
        #endregion
    }
}