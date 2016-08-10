//////// created by ROBBIE ////////
app.controller('manage_content_ctlr', function ($scope, $rootScope, $window, $document, $timeout, $http,
                                                $stateParams, $state, $localStorage, ngDialog, storage, toastr) {

  if($localStorage.userLoggedIn != true || $localStorage.storeId != $stateParams.storeId) {
    // if(!$rootScope.userLoggedIn) {
    $state.go('login');
  }
  var storeId = $stateParams.storeId;
  console.log('manage_content_ctlr', storeId);
  $rootScope.activity = 'Create Tasks';
  $rootScope.$broadcast('received:storeId', { storeId: storeId});

  $scope.isCollapsed = false;
  $scope.$localStorage = $localStorage;
  $scope.priorityOptions = [ 'Mandatory', 'High', 'Medium', 'Low', 'Optional' ];
  $scope.showSave = false;
  $scope.showGroup = -1;

  var refreshPage = function() {
    $http.get($rootScope.apiUrl+'/api/stores/'+ storeId +'/tasks?grouped=true')
      .success(function(data) {
        //console.log("hello"+data.result);

        $scope.groups = [];
        for(i=0;i<data.result.length;i++){
          if(data.result[i] && data.result[i].id == 0) {
            $scope.unassignedGroup = data.result[i];
          } else {
            $scope.groups.push(data.result[i]);
            $scope.groups[i]['isCollapsed'] = false;
          }
        }
      })
      .error(function(error) {
        console.log(error);
      });
  };
  refreshPage();

  var groupScroll2Bottom = function(group_id) {
    document.getElementById('taskListPane-' + group_id).scrollTop = 100000; // to the bottom
  };
  var groupScroll2SavedPos = function(group_id, position) {
    document.getElementById('taskListPane-' + group_id).scrollTop = position; // to the bottom
  };

  ////////////////////// left as incomplete ////////////////////////////////////////
  //var g_taskID;
  //var addTaskItem = function(taskName, taskDuration, task_id, group_id) {
  //  var tgtUL = document.getElementById('groupItems1-' + group_id);
  //  var addLI = document.createElement("li");
  //  addLI.setAttribute("class", "left1 ui-sortable-handle");
  //
  //  var data = "<div id='item-" + task_id + "-" + group_id + "' class='inner-addon left-addon col-md-12' style='height:auto; min-height:20px;'>" +
  //    "<div class='taskDesc' style='position:relative; overflow:hidden; vertical-align:middle; margin-left:0;'>" +
  //    "<p style='float:left; font-size:0.9em; max-width:150px;'>" + taskName + "</p>" +
  //    "<span style='float:right; font-size:9px; margin-right:0;'>" + taskDuration + "</span>" +
  //    "</div></div>";
  //  addLI.innerHTML = data;
  //  tgtUL.appendChild(addLI);
  //
  //  document.getElementById('taskListPane-' + group_id).scrollTop = 100000;
  //
  //  var task = $scope.groups[group_id].groupTasks[0];
  //  task.name = taskName;
  //  task.duration = taskDuration;
  //  task.id = task_id;
  //
  //  $scope.groups[group_id].groupTasks.push(task);
  //
  //}
  //////////////////////////////////////////////////////////////////////////////////

  var empty_array = [{}];
  var addingNewGroup = false;
  $scope.add_new_task_group = function(){
    if(addingNewGroup) return;
    addingNewGroup = true;
    $http.post($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups')
      .success(function(data) {
        console.log(data);
        // data.result.groupTasks = [];
        // $scope.groups.splice(0, 0, data.result);
        if(data.statusCode == 200) {
          refreshPage();
        }
      })
      .error(function(error) {
        console.log(error);
      })
      .finally(function() {
        addingNewGroup = false;
      });
  };

//    $scope.mouseup = function(){
//        console.log('mouseup');
//        for(i=0;i<$scope.groups.length;i++){
//            console.log($scope.groups[i].groupTasks);
//            if($scope.groups[i].groupTasks.length == 0){
//                console.log($scope.groups[i]);
//                $scope.groups[i].groupTasks.push(empty_array);
//            }
//        }
//    }

  $scope.mousedown = function(){
    console.log('mousedown');
    // for(i=0;i<$scope.groups.length;i++){
    //     console.log($scope.groups[i].groupTasks);
    //     if($scope.groups[i].groupTasks.length == 0){
    //         console.log($scope.groups[i]);
    //         $scope.groups[i].groupTasks.push(empty_array);
    //     }
    // }
  };

  $scope.group = {};
  var index_name, groupToEdit, groupModal, editGroupModalActive, oldGroupName;
  var editGroup = function(editedGroup) { // ROBBIE - troubled missing (editedGroup)
    editedGroup.activeRequest = true;
    $http.put($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+ editedGroup.id, {
        name: editedGroup.name,
        duration: editedGroup.duration,
        sequence: editedGroup.sequence
      })
      .success(function(data) {
        if(data.statusCode == '200') {
          toastr.success(editedGroup.name+' - Saved');
          refreshPage();
        }
      })
      .error(function(error) {
        console.log(error);
        toastr.error(error.message);
        refreshPage();
      })
      .finally(function() {
        editedGroup.activeRequest = false;
      })
  };

  var createGroup = function(groupName, groupDuration) {  // ROBBIE - (groupDuration)
    var exists = false;
    for(i=0;i<$scope.groups.length;i++){
      // console.log($scope.groups[i].groupTasks);
      if($scope.groups[i].name == groupName){
        exists = true;
      }
    }
    if(exists) {
      toastr.error(groupName + ' already exists!');
      return;
    }
    if(addingNewGroup) return;
    addingNewGroup = true;
    $http.post($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups')
      .success(function(data) {
        console.log(data);
        // data.result.groupTasks = [];
        // $scope.groups.splice(0, 0, data.result);
        if(data.statusCode == 200) {
          var newGroup = data.result;
          newGroup.name = groupName;

          newGroup.duration = groupDuration;  // ROBBIE
          editGroup(newGroup);

          // ROBBIE - auto-scroll to right
          dragGroupScrollWidth = $('#main .TaskAndGroupContainer #taskListWrap').width();
          dragGroupScrollWidth = dragGroupScrollWidth + 265;
          $('#main .TaskAndGroupContainer').scrollLeft(dragGroupScrollWidth);
        }
      })
      .error(function(error) {
        console.log(error);
      })
      .finally(function() {
        addingNewGroup = false;
      });
  };

  $scope.openGroupModal = function(index){
    if(editGroupModalActive) return;
    // index_name = index;
    // groupToEdit = $scope.groups[index];
    if(index >= 0) {
      groupToEdit = $scope.groups[index];
      $scope.groupName = $scope.groups[index].name;

      $scope.groupDuration = $scope.groups[index].duration;   // ROBBIE
    } else {
      groupToEdit = null;
      $scope.groupName = '';

      $scope.groupDuration = 0;   // ROBBIE
    }
    groupModal = ngDialog.open({
      template: 'save-group',
      // controller: 'dialog_edit_ctrl',
      scope: $scope,
      // overlay: false
    });
    editGroupModalActive = true;
  };

  $scope.saveGroup = function(groupName, groupDuration) { // ROBBIE - (groupDuration)
    console.log(groupToEdit, groupName, groupDuration); // ROBBIE
    if(groupToEdit && groupToEdit.id) {
      // ROBBIE //////
      if(groupName.trim() === '' || groupName.length < 3) {
        toastr.error('Name should be at least 3 characters!');
        return;
      }
      if(groupDuration < 0 || groupDuration > 999) {
        toastr.error('Duration range : 0 ~ 999 min!');
        return;
      }

      console.log('edit');
      groupToEdit.name = groupName;

      groupToEdit.duration = groupDuration;   // ROBBIE
      editGroup(groupToEdit);
    } else {
      // ROBBIE //////
      if(groupName.trim() === '' || groupName.length < 3) {
        toastr.error('Name should be at least 3 characters!');
        return;
      }
      if(groupDuration < 0 || groupDuration > 999) {
        toastr.error('Duration range : 0 ~ 999 min!');
        return;
      }

      console.log('new Group');
      createGroup(groupName, groupDuration);  // ROBBIE
    }
    editGroupModalActive = true;
    groupModal.close();
  };

  $scope.singleClick = function(index) {
    if ($scope.clicked) {
      $scope.cancelClick = true;
      return;
    }

    $scope.clicked = true;

    $timeout(function () {
      if ($scope.cancelClick) {
        $scope.cancelClick = false;
        $scope.clicked = false;
        return;
      }

      $scope.openGroupModal(index);

      //clean up
      $scope.cancelClick = false;
      $scope.clicked = false;
    }, 500);
  };

  $scope.doubleClick = function (index) {

    $timeout(function () {
      $scope.openGroupModal(index);
    });
  };
  $scope.$on('ngDialog.opened',function(e, $dialog){
    console.log('ngDialog.opened', $dialog);
    $timeout(function() {
      groupToEdit && groupToEdit.name?$('#inputGroupName').val(groupToEdit.name):'';
      groupToEdit && groupToEdit.duration?$('#inputGroupDuration').val(groupToEdit.duration):0;  // ROBBIE
    }, 500);
  });

  $scope.$on('ngDialog.closed',function(e, $dialog){
    if(editGroupModalActive) {
      editGroupModalActive = false;
      // var name = storage.get("dialog_group_name");
      // groupToEdit.name = name;
      // editGroup(groupToEdit);
    }
  });

  var deleteGroup, deleteModal;
  $scope.confirmDeleteGroup = function(group) {
    deleteGroup = group;
    deleteModal = ngDialog.open({
      template: 'delete-confirm',
      scope: $scope
    });
  };

  $scope.deleteGroup = function() {
    deleteGroup.activeRequest = true;
    $http.delete($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+ deleteGroup.id)
      .success(function(data) {
        if(data.statusCode == '200') {
          toastr.success(deleteGroup.name+' - Deleted');
          refreshPage();
        }
      })
      .error(function(error) {
        console.log(error);
      })
      .finally(function() {
        deleteGroup.activeRequest = false;
        deleteModal.close();
        deleteGroup = undefined;
      })
  };

  ///////////////////////////////////////////////////////////
  // ROBBIE - combine ///////////////////////////////////////
  var taskModal, taskAddingGroup, taskModifyGroup, taskToEdit;
  var addTaskBtn = null, addTaskPane = null;
  $scope.createTask = function(group) {
    taskAddingGroup = group;

    console.log(addTaskBtn);
    if (addTaskBtn) {
      addTaskBtn.style.display = "block";
      addTaskPane.style.display = "none";
    }

    var addTaskDivWrap = document.getElementById('taskListPane-' + taskAddingGroup.id);
    addTaskDivWrap.scrollTop = 100000;  // to the bottom

    $scope.showSave = true;
    $scope.showGroup = group.id;
    addTaskBtn = document.getElementById('addTaskBtnWrap-' + group.id);
    addTaskPane = document.getElementById('addTaskPaneWrap-' + group.id);
    addTaskBtn.style.display = "none";
    addTaskPane.style.display = "block";

    document.getElementById('inputNewTaskName-' + group.id).focus();
    document.getElementById('inputNewTaskName-' + group.id).value = '';

    editTaskFlag = 1; // Add status

  };

  $scope.saveTask = function(group, taskName, taskDuration) {
    taskName = taskName.replace(/\r?\n/gi, ''); // prevent enter insert

    if(taskName.trim() === '') {    // ROBBIE - trick
      document.getElementById('inputNewTaskName-' + group.id).focus();
      document.getElementById('inputNewTaskName-' + group.id).value = '';
      return;
    }

    taskAddingGroup = group;
    if(taskName === undefined || taskName.length < 3) {
      toastr.error('Name should be at least 3 characters!');
      return;
    }
    if(taskName.length > 80) {  // now unnecessary...
      toastr.error('Name is too long!');
      return;
    }
    if(taskDuration < 0 || taskDuration > 999) {
      toastr.error('Duration range : 0 ~ 999 min!');
      return;
    }

    var exists = false;
    for(i=0; i<taskAddingGroup.groupTasks.length; i++){
      if(taskAddingGroup.groupTasks[i].name == taskName){
        exists = true;
      }
    }
    if(exists) {
      toastr.error('Duplicated Task Name!');
      taskModal.close();
      return;
    }

    taskAddingGroup.activeRequest = true;

    document.getElementById('saveNewTaskBtn-' + group.id).disabled = true;
    document.getElementById('saveNewTaskBtn-' + group.id).style.background = "#cccccc";

    $http.post($rootScope.apiUrl+'/api/stores/'+ storeId +'/tasks', {
        priority: 0,
        sequence: taskAddingGroup.groupTasks.length,
        name : taskName,
        duration : taskDuration
      })
      .success(function(data, headers, config) {
        console.log('data', data);

        //g_taskID = data.result.id;

        if(data.statusCode == 200) {
          $http.post($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+taskAddingGroup.id, {
              taskid: data.result.id,
              sequence: data.result.sequence
            })
            .success(function(data) {
              if(data.statusCode == '200') {
                toastr.success('Task Created');
                refreshPage();

                document.getElementById('saveNewTaskBtn-' + group.id).disabled = false;
                document.getElementById('saveNewTaskBtn-' + group.id).style.background = "#3fa9c8";

                //addTaskItem(taskName, taskDuration, g_taskID, taskAddingGroup.id);  // incomplete...
              }
            })
            .error(function(error) {
              console.log(error);
              toastr.error('Failed to create a task!');

              document.getElementById('saveNewTaskBtn-' + group.id).disabled = false;
              document.getElementById('saveNewTaskBtn-' + group.id).style.background = "#3fa9c8";
            })
            .finally(function() {
              taskAddingGroup.activeRequest = false;
              taskModal.close();
            })
        } else if (data.statusCode != 200) {
          toastr.error(data.result.message);
        }
      })
      .error(function(error, headers, config){
        task.sequence = -1;
        console.log('error', error);
        toastr.error(error.message || 'Error creating task!');
      })
      .finally(function() {
        $scope.activeRequest = false;
        task.activeRequest = false;
      });

  };

  // ROBBIE - DIY modal ////////
  var modal = document.getElementById('rb2Modal');
  var modifyTaskScrollTop;
  var editTaskFlag = 0;
  $scope.modifyTask = function(group, grouptask) {
    taskModifyGroup = group;
    taskToEdit = grouptask;
    $scope.taskName = taskToEdit.name;
    $scope.taskDuration = taskToEdit.duration;

    var listItem = document.getElementById('item-' + grouptask.id + '-' +group.id);
    var parentFrame = document.getElementById("TaskAndGroupContainerID");
    var uncleFrame = document.getElementById('taskListPane-' + group.id);
    var scrollxPos = parentFrame.scrollLeft;
    var scrollyPos = uncleFrame.scrollTop;
    var xPos, yPos;
    xPos = listItem.offsetLeft - scrollxPos;
    yPos = listItem.offsetTop - scrollyPos;
    console.log(xPos + ',' + yPos + ',' + scrollxPos + ',' + scrollyPos);
    modal.style.display = "block";

    modal.style.paddingLeft = xPos + "px";
    modal.style.paddingTop =  yPos + "px";

    document.getElementById("modifyTaskName").focus();
    document.getElementById("modifyTaskName").select(); // seems not to work...

    modifyTaskScrollTop = document.getElementById('taskListPane-' + group.id).scrollTop;
    editTaskFlag = 2; // Edit status
  };

  $scope.closePane = function() {
    $scope.showSave = false;
    addTaskBtn.style.display = "block";
    addTaskPane.style.display = "none";
  };

  $scope.initBtn = function(group) {
    if( $scope.showGroup != group.id )
    {
      document.getElementById('inputNewTaskName-' + taskAddingGroup.id).focus();
      return;
    }
    taskAddingGroup = group;
    addTaskBtn = document.getElementById('addTaskBtnWrap-' + taskAddingGroup.id);
    addTaskPane = document.getElementById('addTaskPaneWrap-' + taskAddingGroup.id);

    document.getElementById('inputNewTaskName-' + taskAddingGroup.id).focus();

    if(editTaskFlag == 1) {
      groupScroll2Bottom(group.id); // so troubled but caught!
    } else if(editTaskFlag == 2) {
      groupScroll2SavedPos(group.id, modifyTaskScrollTop);
    }

  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
    if( $scope.showSave )
    {
      addTaskBtn = document.getElementById('addTaskBtnWrap-' + taskAddingGroup.id);
      addTaskPane = document.getElementById('addTaskPaneWrap-' + taskAddingGroup.id);
    }
    //console.log(event + '===========//');
    if(addTaskPane) {
      var parentFrame = document.getElementById("TaskAndGroupContainerID");
      var scrollxPos = parentFrame.scrollLeft;
      var xPos, yPos;
      xPos = addTaskPane.offsetLeft - scrollxPos;
      yPos = addTaskPane.offsetTop;

      // decide whether mouse-click position is in Pane area or not
      if (event.x > xPos  && event.x < xPos + addTaskPane.offsetWidth &&
        event.y > yPos && event.y < yPos + addTaskPane.offsetHeight) {

        $scope.showSave = true;
        addTaskBtn.style.display = "none";
        addTaskPane.style.display = "block";
      } else {
        $scope.showSave = false;
        addTaskBtn.style.display = "block";
        addTaskPane.style.display = "none";
      }
    }

  }

  window.addEventListener("keyup", function(event) {
    if (event.keyCode == 27) {  // esc key - close add-task
      $scope.showSave = false;
      addTaskBtn.style.display = "block";
      addTaskPane.style.display = "none";
    }
  });

  // DIY modal event function handler - ROBBIE
  $scope.modify_task = function(taskName, taskDuration) {
    taskName = taskName.replace(/\r?\n/gi, ''); // prevent enter insert

    taskToEdit.submitted = true;
    if(!taskName || taskToEdit.activeRequest) {
      return;
    }

    if(taskName.trim() === '' || taskName.length < 3) {
      toastr.error('Name should be at least 3 characters!');
      return;
    }
    if(taskName.length > 80) {  // now unnecessary
      toastr.error('Name is too long!');
      return;
    }
    if(taskDuration < 0 || taskDuration > 999) {
      toastr.error('Duration range : 0 ~ 999 min!');
      return;
    }

    var exists = false;
    for(i=0; i<taskModifyGroup.groupTasks.length; i++){
      if(i == taskToEdit.sequence) {
        //toastr.success('caught!');
        continue;
      }
      if(taskModifyGroup.groupTasks[i].name == taskName){
        exists = true;
      }
    }
    if(exists) {
      toastr.error('Duplicated task name!');
      taskModal.close();
      return;
    }

    $scope.activeRequest = true;
    taskToEdit.activeRequest = true;
    //console.log(taskToEdit);

    document.getElementById('saveTaskBtn').disabled = true;
    document.getElementById('saveTaskBtn').style.background = "#cccccc";

    var taskId = taskToEdit.id;
    //console.log('ROBBIE says==========');
    $http.put($rootScope.apiUrl+'/api/stores/'+ storeId +'/tasks/'+taskId, {
        duration: taskDuration,
        priority: taskToEdit.priority,
        sequence: taskToEdit.sequence,
        name: taskName.trim()
      })
      .success(function(data, headers, config) {
        // console.log('data', data);
        if(data.statusCode == 200) {
          document.getElementById('saveTaskBtn').disabled = false;
          document.getElementById('saveTaskBtn').style.background = "#3fa9c8";

          modal.style.display = "none";   // close modal
          console.log(data.result);
          toastr.success('Task Modified');
          refreshPage();

        }
      })
      .error(function(error, headers, config){
        console.log('error', error);

        document.getElementById('saveTaskBtn').disabled = false;
        document.getElementById('saveTaskBtn').style.background = "#3fa9c8";
      })
      .finally(function() {
        $scope.activeRequest = false;
        taskToEdit.activeRequest = false;
      });
  };

  var taskToDelete = {}, taskToDeleteIndex, deleteTaskModal;
  $scope.confirmDeleteTask = function(grouptask, index) {
    taskToDelete = grouptask;
    taskToDeleteIndex = index;
    deleteTaskModal = ngDialog.open({
      template: 'delete-task-confirm',
      scope: $scope
    });
  };

  $scope.delete_task = function(){
    deleteTaskModal && deleteTaskModal.close();

    if(!taskToDelete || taskToDeleteIndex < 0) {
      return;
    }

    taskToDelete.activeRequest = true;
    $http.delete($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+taskToDelete.group_id+'/'+ taskToDelete.id, {
        data: {
          sequence: taskToDeleteIndex
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .success(function(data) {
        console.log('data', data);
        if(data.statusCode == 200) {
          $scope.activeRequest = true;
          taskToDelete.activeRequest = true;
          $http.delete($rootScope.apiUrl+'/api/stores/'+ storeId +'/tasks/'+taskToDelete.id)
            .success(function(data, headers, config) {
              //$scope.tasks.splice(taskToDeleteIndex, 1);
              toastr.success('Task Deleted');
              refreshPage();
            })
            .error(function(error, headers, config){
              console.log('error', error);
            })
            .finally(function() {
              $scope.activeRequest = false;
            });
        }
      })
      .error(function(error) {
        console.log(error);
      })
      .finally(function(){
        taskToDelete.activeRequest = false;
      })

  };

  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////

  $scope.editGroupDuration = function(groupToEdit) {
    if(!groupToEdit.activeRequest){
      editGroup(groupToEdit);
    }
  };

  $scope.$watch('unassignedGroup.groupTasks.length', function(newVal, oldVal){
    //console.log(newVal, oldVal);
    if($scope.unassignedGroup && $scope.unassignedGroup.groupTasks.length == 0) {
      $scope.unassignedGroup.groupTasks.push(empty_array);
    } else if($scope.unassignedGroup && $scope.unassignedGroup.groupTasks.length == 2){
      for(i=0;i<$scope.unassignedGroup.groupTasks.length;i++){
        if($scope.unassignedGroup.groupTasks[i].name == undefined){
          $scope.unassignedGroup.groupTasks.splice(i,1);
        }
      }
    }
  });

  $scope.dragControlListeners = {
    accept: function (sourceItemHandleScope, destSortableScope) {
      // console.log(sourceItemHandleScope, destSortableScope);
      return true;
    },
    itemMoved: function (eventObj) {
      console.log('itemMoved', eventObj, eventObj.dest.sortableScope.group);
      var task = eventObj.source.itemScope.modelValue;
      var destGroup = eventObj.dest.sortableScope.group;

      // Duplication check - ROBBIE ////////
      var exist = 0;
      for(i=0; i<destGroup.groupTasks.length; i++) {
        if(task.name == destGroup.groupTasks[i].name) {
          exist++;
          if(exist > 1) {
            toastr.error("Duplicated Task Name!");
            refreshPage();
            exist = 0;
            return false;
          }
        }
      }

      if(destGroup && destGroup.id) {
        destGroup.activeRequest = true;
        $http.post($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+ destGroup.id, {
            taskid: task.id,
            sequence: eventObj.dest.index
          })
          .success(function(data) {
            console.log('task added to group', data);
            if(data.statusCode == 200) {
              // destGroup.duration += task.duration;
              refreshPage();
              var groupTasks = eventObj.dest.sortableScope.groups[eventObj.dest.sortableScope.$index].groupTasks;
              for(i=0; i<groupTasks.length; i++){
                if(groupTasks[i].name == undefined){
                  groupTasks.splice(i,1);
                }
              }
            }
          })
          .error(function(error) {
            console.log(error);
          })
          .finally(function(){
            destGroup.activeRequest = false;
          });
      } else {
        task.activeRequest = true;
        $http.delete($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+task.group_id+'/'+ task.id, {
            data: {
              sequence: eventObj.dest.index
            },
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .success(function(data) {
            console.log('data', data);
            if(data.statusCode == 200) {
              console.log(task.duration);
              refreshPage();
            }
          })
          .error(function(error) {
            console.log(error);
          })
          .finally(function(){
            task.activeRequest = false;
          })
      }

      // var groupTasks = eventObj.dest.sortableScope.groups[eventObj.dest.sortableScope.$index].groupTasks;
      // for(i=0;i<groupTasks.length;i++){
      //     if(groupTasks[i].name == undefined){
      //         groupTasks.splice(i,1);
      //     }
      // }
      var moveSuccess = function() {
          console.log('moveSuccess');
        },
        moveFailure = function() {
          console.log('moveFailure');
          eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
          eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.task);
        }
    },
    dragStart: function(){
      onDragStart();
      console.log('dragStart=>>>>>>>>>');
      for(i=0; i<$scope.groups.length; i++){
        //console.log($scope.groups[i].groupTasks);
        if($scope.groups[i].groupTasks.length == 0){
          //console.log($scope.groups[i]);
          $scope.groups[i].groupTasks.push(empty_array);
        }
      }
    },
    dragEnd: function(eventObj) {
      onDragStop();
      console.log('dragEnd task=>>>>>>>>>', eventObj, eventObj.dest.sortableScope.group);
      if(eventObj.source.index == eventObj.dest.index) { return; }
      if(!eventObj.dest.sortableScope.group || eventObj.dest.sortableScope.group.id != eventObj.source.itemScope.modelValue.group_id) {
        return;
      }
      // update task sequence
      var task = eventObj.source.itemScope.modelValue;
      task.sequence = eventObj.dest.index;
      task.activeRequest = true;

      $http.post($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+task.group_id, {
          taskid: task.id,
          sequence: task.sequence
        })
        .success(function(data, headers, config) {
          console.log('data', data);
          if(data.statusCode == 200) {
            return true;
            // $scope.tasks[index] = data.result;
          }
        })
        .error(function(error, headers, config){
          console.log('error', error);
        })
        .finally(function() {
          task.activeRequest = false;
        });

    },
    dragMove: function (itemPosition, containment, eventObj) {
      if (eventObj) {
        var targetX,
          container = $('#main .TaskAndGroupContainer')[0],
          targetX = itemPosition.nowX;    // ROBBIE

        if (targetX < container.clientLeft + container.offsetLeft) {
          onDragDirection(-1);
        } else if (targetX > container.offsetLeft  + container.clientWidth ) {
          onDragDirection(1);
        }
        else {
          vScrollWrap = eventObj.target.parentElement;  // important rope!
          g_targetY = itemPosition.nowY;

          onDragDirection(0);
        }
      }
    }
  };

  $scope.dragGroupControlListeners = {
    accept: function (sourceItemHandleScope, destSortableScope) {
      // console.log(sourceItemHandleScope, destSortableScope);
      // console.log((sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id));
      return (sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id);
    },
    dragStart : function(){
      console.log('dragStart');
      onDragStart();  // ROBBIE
    },
    dragEnd: function(eventObj) {
      onDragStop();   // ROBBIE

      console.log('dragEnd group', eventObj, eventObj.dest.sortableScope.group);
      if(eventObj.source.index == eventObj.dest.index || eventObj.dest.sortableScope.$id != eventObj.source.sortableScope.$id) {
        eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
        eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.modelValue);

        return;
      }
      // update group sequence
      var group = eventObj.source.itemScope.modelValue;
      group.sequence = eventObj.dest.index;
      group.activeRequest = true;
      $http.put($rootScope.apiUrl+'/api/stores/'+ storeId +'/groups/'+group.id, {
          duration: group.duration,
          sequence: eventObj.dest.index,
          name: group.name
        })
        .success(function(data, headers, config) {
          console.log('data', data);
          if(data.statusCode == 200) {
            // ROBBIE
            $('#main .TaskAndGroupContainer').scrollTop(0); // ROBBIE - troubled
            toastr.success('Task List Rearranged');
            //refreshPage();

            return true;
            // $scope.tasks[index] = data.result;
          }
        })
        .error(function(error, headers, config){
          console.log('error', error);
        })
        .finally(function() {
          group.activeRequest = false;
        });

    },
    dragMove: function (itemPosition, containment, eventObj) {
      console.log('dragMove');
      if (eventObj) { // ROBBIE - auto horizontal scroll
        var targetX,
          container = $('#main .TaskAndGroupContainer')[0],
          targetX = itemPosition.nowX;    // ROBBIE

        if (targetX < container.clientLeft + container.offsetLeft) {
          onDragDirection(-1);
        } else if (targetX > container.offsetLeft  + container.clientWidth ) {
          onDragDirection(1);
        }
        else {
          onDragDirection(0);
        }
      }
    }
  };
  var scrollDir = 0;
  var myTimer, vScrollWrap, g_targetY;
  function onDragDirection(dir) {
    scrollDir = dir;
  }
  function onDragStart() {
    myTimer = setInterval(function(){ myDragTimer() }, 10);
  }
  function onDragStop() {
    clearInterval(myTimer);
  }
  function myDragTimer() {
    if( scrollDir == -1 ) {
      container = document.getElementById("TaskAndGroupContainerID");
      container.scrollLeft = container.scrollLeft - 10;
    } else if( scrollDir == 1 ) {
      container = document.getElementById("TaskAndGroupContainerID");
      container.scrollLeft = container.scrollLeft + 10;
    } else {
      if(vScrollWrap.className == 'container' ||
        vScrollWrap.className == 'ng-scope' ||
        vScrollWrap.className == 'container-fluid-allocate' ||
        vScrollWrap.className == '') {
        ; // blank instruction
      } else {
        var topEdgeY, bottomEdgeY;
        if(window.screen.height > 899) {
          topEdgeY = 240;
          bottomEdgeY = 470;
        } else {
          topEdgeY = 240;
          bottomEdgeY = 400;
        }

        if(g_targetY < topEdgeY) {
          vScrollWrap.parentElement.scrollTop = vScrollWrap.parentElement.scrollTop - 3;
          vScrollWrap.scrollTop = vScrollWrap.scrollTop - 3;
        } else if(g_targetY > bottomEdgeY) {
          vScrollWrap.parentElement.scrollTop = vScrollWrap.parentElement.scrollTop + 3;
          vScrollWrap.scrollTop = vScrollWrap.scrollTop + 3;
        }
      }
    }
  }
  /////////////////////////////////////////////////////////////

  $(document).ready(function() {
    var taskListHeight = $(document.body).height() - 58;
    $('#main').height(taskListHeight +'px');
  });

});
