
Assets_Scripts_Models_Rounds_BloonEmissionModel_array *
Assets.Scripts.Simulation.Track.RoundManagers.FreeplayRoundManager$$GetRoundEmissions
          (Assets_Scripts_Simulation_Track_RoundManagers_FreeplayRoundManager_o *__this,
          int32_t roundArrayIndex,MethodInfo *method)

{
  byte bVar1;
  Assets_Scripts_Utils_SeededRandom_o *__this_00;
  Assets_Scripts_Utils_SizedList_Simulation_ThrowawayEffect__o *freeplayGrps;
  Assets_Scripts_Models_Rounds_FreeplayBloonGroupModel_Bounds_array *pAVar2;
  Assets_Scripts_Models_Rounds_FreeplayBloonGroupModel_Bounds_Fields AVar3;
  Assets_Scripts_Models_Rounds_BloonGroupModel_o *__this_02;
  longlong *plVar4;
  Assets_Scripts_Utils_SizedList_Simulation_ProcessDelegate__o *__this_03;
  code *pcVar5;
  char cVar6;
  System_Collections_Generic_List_TSource__o *list;
  Assets_Scripts_Models_GameModel_o *initialSeed;
  longlong *plVar7;
  code **ppcVar8;
  Assets_Scripts_Models_Rounds_FreeplayBloonGroupModel_o *__this_04;
  Assets_Scripts_Models_Rounds_BloonEmissionModel_array *__this_05;
  Il2CppObject *pIVar9;
  longlong lVar10;
  Assets_Scripts_Simulation_Simulation_ProcessDelegate_o *item;
  undefined8 uVar11;
  Facepunch_Steamworks_Inventory_Item_array *pFVar12;
  ushort uVar13;
  uint uVar14;
  int seed;
  int round;
  float fVar15;
  float fVar16;
  double dVar17;
  float roundfloat;
  MethodInfo *Type;
  
  if (DAT_18237fa6c == '\0') {
    thunk_FUN_1802465b0(&Assets.Scripts.Models.Rounds.BloonEmissionModel[]_TypeInfo);
    thunk_FUN_1802465b0(&Assets.Scripts.Models.Rounds.BloonEmissionModel_TypeInfo);
    thunk_FUN_1802465b0(&Method$System.Linq.Enumerable.ToArray<BloonEmissionModel>());
    thunk_FUN_1802465b0(&Method$System.Linq.Enumerable.ToList<FreeplayBloonGroupModel>());
    thunk_FUN_1802465b0(&
                        Method$Assets.Scripts.Utils.Helpers.ShuffleSeeded<FreeplayBloonGroupModel>()
                       );
    thunk_FUN_1802465b0(&Assets.Scripts.Utils.Helpers_TypeInfo);
    thunk_FUN_1802465b0(&System.IDisposable_TypeInfo);
    thunk_FUN_1802465b0(&System.Collections.Generic.IEnumerable<FreeplayBloonGroupModel>_TypeInfo);
    thunk_FUN_1802465b0(&System.Collections.Generic.IEnumerator<FreeplayBloonGroupModel>_TypeInfo);
    thunk_FUN_1802465b0(&System.Collections.IEnumerator_TypeInfo);
    thunk_FUN_1802465b0(&Method$Assets.Scripts.Utils.SizedList<BloonEmissionModel>.Add());
    thunk_FUN_1802465b0(&Method$Assets.Scripts.Utils.SizedList<BloonEmissionModel>.Clear());
    DAT_18237fa6c = '\x01';
  }
  round = roundArrayIndex + 1;
  seed = *(int *)((longlong)&(__this->fields).seededRandom + 4) + round;
  __this_00 = (Assets_Scripts_Utils_SeededRandom_o *)(__this->fields).freeplayGroups;
  if (__this_00 != (Assets_Scripts_Utils_SeededRandom_o *)0x0) {
    Assets.Scripts.Utils.SeededRandom$$SetSeed(__this_00,(longlong)seed,(MethodInfo *)0x0);
    if (*(longlong *)&__this->fields != 0) {
      list = System.Linq.Enumerable$$ToList<TowerToSimulation>
                       (*(System_Collections_Generic_IEnumerable_TSource__o **)
                         (*(longlong *)&__this->fields + 0xf0),
                        Method$System.Linq.Enumerable.ToList<FreeplayBloonGroupModel>());
      if (((*(byte *)(Assets.Scripts.Utils.Helpers_TypeInfo + 0x133) & 4) != 0) &&
         (*(int *)(Assets.Scripts.Utils.Helpers_TypeInfo + 0xe0) == 0)) {
        il2cpp_runtime_class_init();
      }
      initialSeed = Assets.Scripts.Utils.Helpers.ShuffleSeeded(list,seed); // List<BloonGroupModel>
      (__this->fields).model = initialSeed; // initialSeed or SeededRandom
      Type = (MethodInfo *)(__this->fields).freeplayGroups;
      if (Type != (MethodInfo *)0x0) { //?????????? some type check
        seededRandomValue = Assets.Scripts.Utils.SeededRandom.get_value(); //.value getter
        *(float *)&(__this->fields).seededRandom = seededRandomValue;
        roundfloat = (float)round;
        fVar15 = Assets.Scripts.Simulation.SMath.Math.Pow(roundfloat,7.7);
        fVar16 = Assets.Scripts.Simulation.SMath.Math.Pow(roundfloat,1.75);
        uVar14 = round * -3 + 400;
        Type = (MethodInfo *)(ulonglong)uVar14;
        dVar17 = (double)uVar14 * (((double)fVar15 * 5e-11 + (double)fVar16 + 20.0) / 160.0) *
                 ((double)round * 0.01 + 1.0) * 0.6;
        if (50 < round) {
          fVar15 = Assets.Scripts.Simulation.SMath.Math$$Pow(roundfloat,7.7);
          fVar16 = Assets.Scripts.Simulation.SMath.Math$$Pow(roundfloat,1.75);
          dVar17 = (double)fVar15 * 5e-11 + (double)fVar16 + 20.0;
        }
        if (100 < round) {
          dVar17 = (double)((roundArrayIndex -64) * 5000);
        }
        if (1 < round) {
          dVar17 = dVar17 - ((double)*(float *)&(__this->fields).seededRandom - 0.5) * dVar17;
        }
        fVar15 = 0.0;
        fVar16 = 0.0;
        freeplayGrps = *(Assets_Scripts_Utils_SizedList_Simulation_ThrowawayEffect__o **)
                     &(__this->fields).budgetMultiplierThisRound;
        if ((freeplayGrps != (Assets_Scripts_Utils_SizedList_Simulation_ThrowawayEffect__o *)0x0) &&
           (Assets.Scripts.Utils.SizedList<Simulation.ThrowawayEffect>$$Clear
                      (freeplayGrps,Method$Assets.Scripts.Utils.SizedList<BloonEmissionModel>.Clear()),
           (__this->fields).model != (Assets_Scripts_Models_GameModel_o *)0x0)) {
          plVar7 = (longlong *)
                   FUN_1800640e0(0,
                                 System.Collections.Generic.IEnumerable<FreeplayBloonGroupModel>_TypeInfo
                                );
LAB_180e86e40:
          if (plVar7 != (longlong *)0x0) {
            cVar6 = FUN_1800640e0();
            if (cVar6 == '\0') {
              FUN_1800640e0(0,System.IDisposable_TypeInfo,plVar7);
              pFVar12 = System.Linq.Enumerable$$ToArray<Inventory.Item>
                                  (*(System_Collections_Generic_IEnumerable_TSource__o **)
                                    &(__this->fields).budgetMultiplierThisRound,
                                   Method$System.Linq.Enumerable.ToArray<BloonEmissionModel>());
              return (Assets_Scripts_Models_Rounds_BloonEmissionModel_array *)pFVar12;
            }
            lVar10 = *plVar7;
            uVar13 = 0;
            if (*(ushort *)(lVar10 + 0x12a) != 0) {
              do {
                if (*(longlong *)(*(longlong *)(lVar10 + 0xb0) + (ulonglong)uVar13 * 0x10) ==
                    System.Collections.Generic.IEnumerator<FreeplayBloonGroupModel>_TypeInfo) {
                  ppcVar8 = (code **)((longlong)
                                      *(int *)(*(longlong *)(lVar10 + 0xb0) + 8 +
                                              (ulonglong)uVar13 * 0x10) * 0x10 + 0x138 + lVar10);
                  goto LAB_180e86eb5;
                }
                uVar13 = uVar13 + 1;
              } while (uVar13 < *(ushort *)(lVar10 + 0x12a));
            }
            ppcVar8 = (code **)FUN_18023bd40(plVar7,
                                             System.Collections.Generic.IEnumerator<FreeplayBloonGroupModel>_TypeInfo
                                             ,0);
LAB_180e86eb5:
            __this_04 = (Assets_Scripts_Models_Rounds_FreeplayBloonGroupModel_o *)
                        (**ppcVar8)(plVar7,ppcVar8[1]);
            if (__this_04 == (Assets_Scripts_Models_Rounds_FreeplayBloonGroupModel_o *)0x0)
            goto LAB_180e8710b;
            pAVar2 = (__this_04->fields).bounds;
            uVar14 = 0;
            while( true ) {
              if (pAVar2 == (Assets_Scripts_Models_Rounds_FreeplayBloonGroupModel_Bounds_array *)0x0
                 ) goto LAB_180e87106;
              if ((int)*(uint *)&pAVar2->max_length <= (int)uVar14) goto LAB_180e86e40;
              if (*(uint *)&pAVar2->max_length <= uVar14) goto LAB_180e870c9;
              AVar3 = pAVar2->m_Items[(int)uVar14].fields;
              if ((SUB84(AVar3,0) <= round) && (round <= (int)((ulonglong)AVar3 >> 0x20))) break;
              uVar14 = uVar14 + 1;
            }
            roundfloat = Assets.Scripts.Models.Rounds.FreeplayBloonGroupModel$$CalculateScore
                                   (__this_04,*(Assets_Scripts_Models_GameModel_o **)&__this->fields
                                    ,(MethodInfo *)0x0);
            if ((double)roundfloat <= dVar17) {
              __this_05 = (__this_04->fields).bloonEmissions_;
              if (__this_05 == (Assets_Scripts_Models_Rounds_BloonEmissionModel_array *)0x0) {
                __this_02 = (__this_04->fields).group;
                if (__this_02 == (Assets_Scripts_Models_Rounds_BloonGroupModel_o *)0x0)
                goto LAB_180e870e8;
                __this_05 = Assets.Scripts.Models.Rounds.BloonGroupModel$$GetEmissions
                                      (__this_02,(MethodInfo *)0x0);
                (__this_04->fields).bloonEmissions_ = __this_05;
                if (__this_05 == (Assets_Scripts_Models_Rounds_BloonEmissionModel_array *)0x0)
                goto LAB_180e87101;
              }
              pIVar9 = Assets.Scripts.Unity.UI_New.ChallengeEditor.ChallengeBrowserDisplayInfo$$Clone
                                 ((Assets_Scripts_Unity_UI_New_ChallengeEditor_ChallengeBrowserDisplayInfo_o
                                   *)__this_05,(MethodInfo *)0x0);
              lVar10 = thunk_FUN_1802480f0(pIVar9,
                                           Assets.Scripts.Models.Rounds.BloonEmissionModel[]_TypeInfo
                                          );
              uVar14 = 0;
              while( true ) {
                if (lVar10 == 0) goto LAB_180e870fc;
                if ((int)*(uint *)(lVar10 + 0x18) <= (int)uVar14) break;
                if (*(uint *)(lVar10 + 0x18) <= uVar14) goto LAB_180e870d9;
                plVar4 = *(longlong **)(lVar10 + 0x20 + (longlong)(int)uVar14 * 8);
                if (plVar4 == (longlong *)0x0) goto LAB_180e870f7;
                item = (Assets_Scripts_Simulation_Simulation_ProcessDelegate_o *)
                       (**(code **)(*plVar4 + 0x178))(plVar4,*(undefined8 *)(*plVar4 + 0x180));
                if (item == (Assets_Scripts_Simulation_Simulation_ProcessDelegate_o *)0x0)
                goto LAB_180e870f2;
                bVar1 = (Assets.Scripts.Models.Rounds.BloonEmissionModel_TypeInfo->_2).
                        typeHierarchyDepth;
                if (((item->klass->_2).typeHierarchyDepth < bVar1) ||
                   ((item->klass->_2).typeHierarchy[(ulonglong)bVar1 - 1] !=
                    Assets.Scripts.Models.Rounds.BloonEmissionModel_TypeInfo)) goto LAB_180e870f2;
                fVar16 = *(float *)&(item->fields).super.super.extra_arg + fVar15;
                *(float *)&(item->fields).super.super.extra_arg = fVar16;
                __this_03 = *(Assets_Scripts_Utils_SizedList_Simulation_ProcessDelegate__o **)
                             &(__this->fields).budgetMultiplierThisRound;
                if (__this_03 == (Assets_Scripts_Utils_SizedList_Simulation_ProcessDelegate__o *)0x0
                   ) goto LAB_180e870ed;
                Assets.Scripts.Utils.SizedList<Simulation.ProcessDelegate>$$Add
                          (__this_03,item,
                           Method$Assets.Scripts.Utils.SizedList<BloonEmissionModel>.Add());
                uVar14 = uVar14 + 1;
              }
              fVar15 = fVar16;
              roundfloat = Assets.Scripts.Models.Rounds.FreeplayBloonGroupModel$$CalculateScore
                                     (__this_04,
                                      *(Assets_Scripts_Models_GameModel_o **)&__this->fields,
                                      (MethodInfo *)0x0);
              dVar17 = dVar17 - (double)roundfloat;
            }
            goto LAB_180e86e40;
          }
          goto LAB_180e87110;
        }
      }
    }
  }
  FUN_18027ffd0();
LAB_180e870c9:
  uVar11 = thunk_FUN_18023bbd0();
  FUN_18027ffa0(uVar11,0);
LAB_180e870d9:
  uVar11 = thunk_FUN_18023bbd0();
  FUN_18027ffa0(uVar11,0);
LAB_180e870e8:
  FUN_18027ffd0();
LAB_180e870ed:
  FUN_18027ffd0();
LAB_180e870f2:
  FUN_18027ffd0();
LAB_180e870f7:
  FUN_18027ffd0();
LAB_180e870fc:
  FUN_18027ffd0();
LAB_180e87101:
  FUN_18027ffd0();
LAB_180e87106:
  FUN_18027ffd0();
LAB_180e8710b:
  FUN_18027ffd0();
LAB_180e87110:
  FUN_18027ffd0();
  FUN_18027ffa0(0,0);
  pcVar5 = (code *)swi(3);
  pFVar12 = (Facepunch_Steamworks_Inventory_Item_array *)(*pcVar5)();
  return (Assets_Scripts_Models_Rounds_BloonEmissionModel_array *)pFVar12;
}

