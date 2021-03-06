'use strict';

var ACTIVITY_DATA_ADDED_EVENT = 'ACTIVITY_DATA_ADDED_EVENT';
var ACTIVITY_DATA_REMOVED_EVENT = 'ACTIVITY_DATA_REMOVED_EVENT';

var GRAPH_SELECTED_EVENT = 'GRAPH_SELECTED_EVENT';

var TAB_SELECTED_EVENT = 'TAB_SELECTED_EVENT';

/**
 * Represents a single activity data point.
 * @param ACT_TY The type of activity. A string
 * @param healthMetricsDict A dictionary of different health metrics. The key is the
 * health data type (e.g., energy level, stress level, etc.), while the value is
 * the value the user gave to that activity.
 * @param ACT_DUR_MIN A number
 * @constructor
 */
var ActivityData = function(ACT_TY, healthMetricsDict, ACT_DUR_MIN) {
    this.ACT_TY = ACT_TY;
    this.ACT_DICTION = healthMetricsDict;
    this.ACT_DUR_MIN = ACT_DUR_MIN
};

/**
 * An object which tracks all of the data
 * @constructor
 */
var ActivityCollectionModel = function() {
    // Maintains a list of listeners.
    this.listeners = [];
    this.data_points = [];
    this.LAST_SUMM_data = null;


    this.pusher = function(eventType, eventData) {
        var date_time = new Date();
        _.each(this.listeners, function(listener) {
           listener(eventType, date_time, eventData); 
           console.log(eventData);
        });
    }
};

// _ is the Underscore library
// This extends the JavaScript prototype with additional methods
// This is a common idiom for defining JavaScript classes
_.extend(ActivityCollectionModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, activityData) where eventType is a string indicating
     * the event type (one of ACTIVITY_DATA_ADDED_EVENT or ACTIVITY_DATA_REMOVED_EVENT), and
     * activityData the ActivityData added or removed.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
        }
    },

    /**
     * Should add the given data point, and alert listeners that a new data point has
     * been added.
     * @param activityDataPoint
     */
    addActivityDataPoint: function(activityDataPoint) {
        this.data_points.push(activityDataPoint);
        this.pusher(ACTIVITY_DATA_ADDED_EVENT, activityDataPoint);
    },

    /**
     * Should remove the given data point (if it exists), and alert listeners that
     * it was removed. It should NOT alert listeners if that data point did not
     * exist in the data store
     * @param activityDataPoint
     */
    removeActivityDataPoint: function(activityDataPoint) {
        if (this.data_points.indexOf(activityDataPoint) > -1) {
            array.splice(index, 1);
            this.pusher(ACTIVITY_DATA_REMOVED_EVENT, activityDataPoint);
        }
    },

    /**
     * Should return an array of all activity data points
     */
    getActivityDataPoints: function() {
        return this.data_points;
    }
});

/**
 * The GraphModel tracks what the currently selected graph is.
 * You should structure your architecture so that when the user chooses
 * a new graph, the event handling code for choosing that graph merely
 * sets the new graph here, in the GraphModel. The graph handling code
 * should then update to show the selected graph, along with any components
 * necessary to configure that graph.
 * @constructor
 */
var GraphModel = function() {
    this.listeners = [];
    this.VAILD_GRPH = [
        'List_OBJ',
        'TIME_NEED_GRPH' 
    ];
    this.currentGraph = this.VAILD_GRPH[0];

    this.pusher = function(eventType, eventData) {
        if (eventData != this.currentGraph) {
            _.each(this.listeners, function(listener) {
                var date_current = new Date();
               listener(eventType, date_current, eventData); 
            });
        }
    }
};

_.extend(GraphModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, eventData) where eventType is a string indicating
     * the event type (specifically, GRAPH_SELECTED_EVENT),
     * and eventData indicates the name of the new graph.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
        }
    },

    /**
     * Returns a list of graphs (strings) that can be selected by the user
     */
    getAvailableGraphNames: function() {
        return this.VAILD_GRPH;
    },

    /**
     * Should return the name of the currently selected graph. There should
     * *always* be one graph that is currently available.
     */
    getNameOfCurrentlySelectedGraph: function() {
        return this.currentGraph;
    },

    /**
     * Changes the currently selected graph to the graph name given. Should
     * broadcast an event to all listeners that the graph changed.
     * @param graphName
     */
    selectGraph: function(graphName) {
        if (this.getAvailableGraphNames().indexOf(graphName) > -1) {
            this.pusher(GRAPH_SELECTED_EVENT, graphName);
            this.currentGraph = graphName;
        }

    }
});

/**
 * The TabModel maintains the current selected tab.
 */
var TabModel = function() {
    this.listeners = [];
    this.availableTabName = [
        'InputTab',
        'AnalysisTab'
    ]
    this.currentTab = this.availableTabName[0];
    this.pusher = function(eventType, eventData) {
        if (eventData != this.currentTab) {
            _.each(this.listeners, function(listener) {
               listener(eventType, Date.now(), eventData); 
            });
        }
    }
}

_.extend(TabModel.prototype, {
    addListener: function(listener) {
        this.listeners.push(listener);
    }, 
    removeListener: function(listener) {
        var index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
        }
    },
    getNameOfCurrentlySelectedTab: function() {
        return this.currentTab;
    },
    selectTab: function(tabName) {
        this.pusher(TAB_SELECTED_EVENT, tabName);
        this.currentTab = tabName;
    }
});




/**
 * Will generate a number of random data points and add them to the model provided.
 * If numDataPointsToGenerate is not provided, will generate and add 100 data points.
 * @param activityModel The model to add data to
 * @param numDataPointsToGenerate The number of points to generate.
 *
 * Example:
 *
 * generateFakeData(new ActivityCollectionModel(), 5);
 */
function generateFakeData(activityModel, numDataPointsToGenerate) {
    var fakeActivities = [];
    _.times(
        5,
        function() {
            fakeActivities.push("Act " + (fakeActivities.length + 1));
        }
    );
    numDataPointsToGenerate = (!_.isNumber(numDataPointsToGenerate) || numDataPointsToGenerate < 0) ? 100 : numDataPointsToGenerate;
    _.times(
        numDataPointsToGenerate,
        function() {
            var activityDataPoint = new ActivityData(
                fakeActivities[_.random(fakeActivities.length - 1)], {
                    energy: _.random(1,5),
                    stress: _.random(1,5),
                    happiness: _.random(1,5)
                },
                _.random(1,290)
            );
            activityModel.addActivityDataPoint(activityDataPoint);
        }
    );
}