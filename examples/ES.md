# Elasticsearch (ES) search types explained (`QUERY_THEN_FETCH`, `QUERY_AND_FETCH`, `DFS_QUERY_THEN_FETCH` and `DFS_QUERY_AND_FETCH`)

When querying, you can specify the search type as `QUERY_THEN_FETCH`, `QUERY_AND_FETCH`, `DFS_QUERY_THEN_FETCH` and `DFS_QUERY_AND_FETCH`. So what is the difference between these 4 search types?

ES is distributed, but distributed has disadvantages. For example, if you want to search for a word, but the data is on 5 shards, these 5 shards may be on 5 hosts. Because full-text search is inherently sorted (ranked according to the degree of matching), but the data is on 5 shards, how to get the final correct sorting? ES does this in roughly two steps.

Step1. The ES client will initiate a search request to 5 shards for this search term at the same time, which is called Scatter,

Step 2. These 5 shards independently complete the search based on this shard, and then return all the results that meet the conditions. This step is called Gather.

The client reorders and ranks the returned results, and finally returns them to the user. That is to say, a search of ES is a scatter/gather process (this is also very similar to mapreduce).

However, there are two problems with this.

First, the question of quantity. For example, the user needs to search for "Koishi", and is required to return the top 10 most matching conditions. However, in the 5 shards, data related to "Koishi" may be stored. So ES will send a query request to these 5 shards, and ask each shard to return 10 records that meet the conditions. After the ES gets the returned results, it performs overall sorting, and then returns the top 10 most eligible items to the user. In this case, ES5 shards will receive at most 10\*5=50 records, so the number of results returned to the user will be more than the number of user requests.

Second, the ranking problem. In the above search, the calculation score of each shard is calculated based on its own shard data. The word frequency and other information used to calculate the score are based on its own shards, and the overall ranking of ES is based on the calculated scores of each shard, which may lead to inaccurate rankings. If we want to control the sorting more precisely, we should first collect the sorting and ranking-related information (word frequency, etc.) from 5 shards, perform a unified calculation, and then use the overall word frequency to query each shard.

It is thought that ES does not have any good solutions for these two problems, and ultimately the decision is left to the user. The different search types is for specifying the query type when searching.

1. **query and fetch**

    A query request is sent to all shards of the index, and when each shard is returned, the data/document/file? and the calculated ranking information are returned together. This search method is the fastest. Because compared to the following search methods, this query method only needs to query the shard once. However, the total number of results returned by all the shards may be n times (i.e. much larger than) the size requested by the user.

2. **query then fetch (default search method)**

    If you do not specify a search method when you search, this is the search method used.

    This search method is roughly divided into two steps.

    1. Send a request to all shards. Each shard only returns information related to sorting and ranking (note that the data/document/file? is not included). It then sorts and ranks the information related to sorting and ranking and from there takes the amount of data required by the users.
    2. Get the data/document/file? from the relevant shard. The data returned in this way is the same size as requested by the user.

3. **DFS query and fetch**

    This method has one more initial scatter step than simply "query and fetch". With this extra step, the search scoring and ranking can be controlled more precisely.

4. **DFS query then fetch**

    There is one more initial scatter step than "query then fetch"

### So what does DFS mean?

This D may be Distributed, F may be Frequency, and S may be Scatter, idk.

### How does the initial distribution work?

From the official website of ES, the initial distribution is done before performing the real query, to collect the word frequency and data/document/file? frequency of each shard. Then when performing word search, each shard is based on the global word frequency and data/document/file? frequency to search and rank.

Obviously, `DFS_QUERY_THEN_FETCH`'s efficiency is the lowest, because one search may require 3 shards. However, with the DFS method, the search accuracy should be the highest.

**TL;DR: `QUERY_AND_FETCH` is the fastest and `DFS_QUERY_THEN_FETCH` is the slowest in terms of performance. In terms of search accuracy, DFS is more accurate than non-DFS.**
